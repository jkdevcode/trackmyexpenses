import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfirmFacturaDto } from '../../factura-ocr/dto/confirm-factura.dto';
import { ScanResponseDto } from '../../factura-ocr/dto/scan-response.dto';
import { RequestContext } from '../../common/context/request-context';
import { ImageProcessorService } from './image-processor.service';
import { OcrService } from './ocr.service';
import { TextParserService } from './text-parser.service';

@Injectable()
export class FacturaOcrOrchestrator {
  private readonly logger = new Logger(FacturaOcrOrchestrator.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly imageProcessor: ImageProcessorService,
    private readonly ocrService: OcrService,
    private readonly textParser: TextParserService,
  ) {}

  async processImage(file: Express.Multer.File): Promise<ScanResponseDto> {
    try {
      const processedBuffer = await this.imageProcessor.process(file.buffer);
      const rawText = await this.ocrService.extractText(processedBuffer);
      const parsedResult = await this.textParser.parseAndEnrich(rawText);

      return {
        rawText,
        parsed: parsedResult.parsed,
        usedFallbackParser: parsedResult.usedFallbackParser,
      };
    } catch (error) {
      this.logger.error({
        msg: 'Error processing OCR',
        requestId: RequestContext.getRequestId(),
        error,
      });
      throw new InternalServerErrorException(
        'Error procesando la imagen de la factura',
      );
    }
  }

  async confirmarFactura(userId: number, dto: ConfirmFacturaDto) {
    const { factura, productos } = dto;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const codigoFactura = `OCR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const nuevaFactura = await tx.factura.create({
          data: {
            usuarioId: userId,
            codigoFactura,
            fechaHoraCompra: new Date(factura.fechaHoraCompra),
            metodoPago: factura.metodoPago as any,
            lugarCompra: factura.lugarCompra,
            nitProveedor: factura.nitProveedor,
            totalPagar: 0,
          },
        });

        let totalCalculado = 0;

        for (const item of productos) {
          const nombreClean = item.nombreDetectado.trim().toUpperCase();
          const cantidad = Number(item.cantidadDetectada);
          const precioUnitario = Number(item.precioUnitario);
          const descuento = Number(item.descuentoDetectado || 0);

          if (cantidad <= 0) continue;

          let producto = await tx.producto.findFirst({
            where: { nombre: nombreClean },
          });

          if (!producto) {
            const uniqueCode = `PROD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            producto = await tx.producto.create({
              data: {
                nombre: nombreClean,
                codigo: uniqueCode,
                precioUnitario,
              },
            });
          }

          const precioTotalItem = precioUnitario * cantidad - descuento;
          totalCalculado += precioTotalItem;

          await tx.facturaProducto.create({
            data: {
              facturaId: nuevaFactura.id,
              productoId: producto.id,
              cantidad,
              unidad: item.unidadDetectada || 'u',
              descuento: new Prisma.Decimal(descuento),
              precioTotal: new Prisma.Decimal(precioTotalItem),
            },
          });
        }

        const facturaActualizada = await tx.factura.update({
          where: { id: nuevaFactura.id },
          data: { totalPagar: totalCalculado },
          include: {
            productos: {
              include: { producto: true },
            },
          },
        });

        return facturaActualizada;
      });

      return {
        status: 201,
        message: 'Factura OCR confirmada exitosamente',
        data: { factura: result },
      };
    } catch (error: unknown) {
      this.logger.error({
        msg: 'Error confirming factura',
        requestId: RequestContext.getRequestId(),
        error,
      });
      throw new InternalServerErrorException('Error al confirmar factura');
    }
  }
}
