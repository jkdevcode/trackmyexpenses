import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { AddProductoFacturaDto } from './dto/add-producto.dto';
import { ConfirmFacturaDto } from './dto/confirm-factura.dto';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { Prisma } from '@prisma/client';
import { Logger } from 'nestjs-pino';
import { PeriodFilter } from './factura.types';
import { RequestContext } from '../common/context/request-context';

const FACTURA_LIST_SELECT = {
  id: true,
  codigoFactura: true,
  metodoPago: true,
  lugarCompra: true,
  nitProveedor: true,
  fechaHoraCompra: true,
  totalPagar: true,
  usuarioId: true,
} as const;

type FacturaStats = {
  currentPeriodInvoices: number;
  totalSpending: number;
  spendingTrend: number;
  totalInvoices: number;
};

@Injectable()
export class FacturaService {
  constructor(
    private prisma: PrismaService,
    private logger: Logger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(userId: number, dto: CreateFacturaDto) {
    try {
      const codigoFactura = this.generateFacturaCode('FAC');

      const factura = await this.prisma.factura.create({
        data: {
          codigoFactura,
          metodoPago: dto.metodoPago,
          lugarCompra: dto.lugarCompra || 'Comercio Desconocido',
          nitProveedor: dto.nitProveedor,
          fechaHoraCompra: new Date(dto.fecha),
          totalPagar: dto.total,
          usuarioId: userId,
        },
        select: FACTURA_LIST_SELECT,
      });

      return {
        status: 201,
        message: 'Factura creada exitosamente',
        factura,
      };
    } catch (error: unknown) {
      this.logger.error({
        msg: 'Error al crear factura',
        requestId: RequestContext.getRequestId(),
        error,
      });
      throw new InternalServerErrorException('Error al crear factura');
    }
  }

  async createFromOcr(userId: number, dto: ConfirmFacturaDto) {
    const { factura, productos } = dto;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const nuevaFactura = await tx.factura.create({
          data: {
            usuarioId: userId,
            codigoFactura: this.generateFacturaCode('OCR'),
            fechaHoraCompra: new Date(factura.fechaHoraCompra),
            metodoPago:
              factura.metodoPago as Prisma.FacturaCreateInput['metodoPago'],
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

          if (cantidad <= 0) {
            continue;
          }

          const producto = await this.resolveOrCreateProducto(
            tx,
            nombreClean,
            precioUnitario,
          );

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

        return tx.factura.update({
          where: { id: nuevaFactura.id },
          data: { totalPagar: totalCalculado },
          include: {
            productos: {
              include: { producto: true },
            },
          },
        });
      });

      return {
        status: 201,
        message: 'Factura OCR confirmada exitosamente',
        data: { factura: result },
      };
    } catch (error: unknown) {
      this.logger.error({
        msg: 'Error al crear factura desde OCR',
        requestId: RequestContext.getRequestId(),
        error,
      });
      throw new InternalServerErrorException('Error al confirmar factura');
    }
  }

  async findAll(
    userId: number,
    period: PeriodFilter = 'month',
    page = 1,
    limit = 20,
  ) {
    try {
      const { startDate, endDate, prevStartDate, prevEndDate } =
        this.getPeriodWindow(period);

      const where = {
        usuarioId: userId,
        fechaHoraCompra: {
          gte: startDate,
          lte: endDate,
        },
      };

      const skip = (page - 1) * limit;

      const [facturas, total, stats] = await Promise.all([
        this.prisma.factura.findMany({
          where,
          orderBy: {
            fechaHoraCompra: 'desc',
          },
          skip,
          take: limit,
          select: FACTURA_LIST_SELECT,
        }),
        this.prisma.factura.count({ where }),
        this.calculateStats(
          userId,
          startDate,
          endDate,
          prevStartDate,
          prevEndDate,
        ),
      ]);

      return {
        status: 200,
        message: 'Facturas obtenidas exitosamente',
        data: facturas,
        facturas,
        pagination: {
          page,
          limit,
          total,
        },
        stats,
      };
    } catch (error: unknown) {
      this.logger.error({
        msg: 'Error al obtener facturas',
        requestId: RequestContext.getRequestId(),
        error,
      });
      throw new InternalServerErrorException('Error al obtener facturas');
    }
  }

  async getStats(userId: number, period: PeriodFilter = 'month') {
    const cacheKey = `factura:stats:${userId}:${period}`;
    const cached = await this.cacheManager.get<FacturaStats>(cacheKey);
    if (cached) {
      return {
        status: 200,
        message: 'Estadisticas obtenidas exitosamente (cache)',
        stats: cached,
      };
    }

    const { startDate, endDate, prevStartDate, prevEndDate } =
      this.getPeriodWindow(period);

    const stats = await this.calculateStats(
      userId,
      startDate,
      endDate,
      prevStartDate,
      prevEndDate,
    );

    await this.cacheManager.set(cacheKey, stats, 600000);

    return {
      status: 200,
      message: 'Estadisticas obtenidas exitosamente',
      stats,
    };
  }

  async addProducto(
    userId: number,
    facturaId: number,
    dto: AddProductoFacturaDto,
  ) {
    const factura = await this.prisma.factura.findFirst({
      where: {
        id: facturaId,
        usuarioId: userId,
      },
      select: { id: true },
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    const producto = await this.prisma.producto.findUnique({
      where: { id: dto.productoId },
      select: { id: true, precioUnitario: true },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    const precioUnitario = Number(producto.precioUnitario);
    const descuento = dto.descuento || 0;
    const precioConDescuento = precioUnitario * (1 - descuento / 100);
    const precioTotal = precioConDescuento * dto.cantidad;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const fp = await tx.facturaProducto.create({
          data: {
            facturaId,
            productoId: dto.productoId,
            cantidad: dto.cantidad,
            descuento: new Prisma.Decimal(descuento),
            precioTotal: new Prisma.Decimal(precioTotal),
          },
          select: {
            id: true,
            facturaId: true,
            productoId: true,
            cantidad: true,
            descuento: true,
            precioTotal: true,
          },
        });

        const updatedFactura = await tx.factura.update({
          where: { id: facturaId },
          data: {
            totalPagar: { increment: precioTotal },
          },
          select: {
            id: true,
            codigoFactura: true,
            totalPagar: true,
            productos: {
              select: {
                id: true,
                productoId: true,
                cantidad: true,
                descuento: true,
                precioTotal: true,
                producto: {
                  select: {
                    id: true,
                    codigo: true,
                    nombre: true,
                    precioUnitario: true,
                  },
                },
              },
            },
          },
        });

        return { fp, updatedFactura };
      });

      return {
        status: 201,
        message: 'Producto agregado a factura exitosamente',
        data: result,
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('El producto ya esta en la factura');
      }

      this.logger.error({
        msg: 'Error agregando producto',
        requestId: RequestContext.getRequestId(),
        error,
      });

      throw new InternalServerErrorException(
        'Error al agregar producto a factura',
      );
    }
  }

  private getPeriodWindow(period: PeriodFilter) {
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();
    const prevStartDate = new Date();
    const prevEndDate = new Date();

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    switch (period) {
      case 'day':
        prevStartDate.setDate(now.getDate() - 1);
        prevStartDate.setHours(0, 0, 0, 0);
        prevEndDate.setDate(now.getDate() - 1);
        prevEndDate.setHours(23, 59, 59, 999);
        break;
      case 'week': {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);

        prevStartDate.setTime(startDate.getTime());
        prevStartDate.setDate(startDate.getDate() - 7);
        prevEndDate.setTime(prevStartDate.getTime());
        prevEndDate.setDate(prevStartDate.getDate() + 6);
        prevEndDate.setHours(23, 59, 59, 999);
        break;
      }
      case 'year':
        startDate.setMonth(0, 1);

        prevStartDate.setFullYear(now.getFullYear() - 1, 0, 1);
        prevStartDate.setHours(0, 0, 0, 0);
        prevEndDate.setFullYear(now.getFullYear() - 1, 11, 31);
        prevEndDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
      default:
        startDate.setDate(1);

        prevStartDate.setMonth(now.getMonth() - 1, 1);
        prevStartDate.setHours(0, 0, 0, 0);
        prevEndDate.setDate(0);
        prevEndDate.setHours(23, 59, 59, 999);
        break;
    }

    return { startDate, endDate, prevStartDate, prevEndDate };
  }

  private async calculateStats(
    userId: number,
    startDate: Date,
    endDate: Date,
    prevStartDate: Date,
    prevEndDate: Date,
  ): Promise<FacturaStats> {
    const [
      currentPeriodCount,
      currentPeriodAggregate,
      totalInvoices,
      prevFacturasAggregate,
    ] = await Promise.all([
      this.prisma.factura.count({
        where: {
          usuarioId: userId,
          fechaHoraCompra: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      this.prisma.factura.aggregate({
        where: {
          usuarioId: userId,
          fechaHoraCompra: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          totalPagar: true,
        },
      }),
      this.prisma.factura.count({
        where: { usuarioId: userId },
      }),
      this.prisma.factura.aggregate({
        where: {
          usuarioId: userId,
          fechaHoraCompra: {
            gte: prevStartDate,
            lte: prevEndDate,
          },
        },
        _sum: {
          totalPagar: true,
        },
      }),
    ]);

    const totalSpending = Number(currentPeriodAggregate._sum.totalPagar) || 0;
    const prevTotalSpending =
      Number(prevFacturasAggregate._sum.totalPagar) || 0;

    let spendingTrend = 0;
    if (prevTotalSpending > 0) {
      spendingTrend =
        ((totalSpending - prevTotalSpending) / prevTotalSpending) * 100;
    } else if (totalSpending > 0) {
      spendingTrend = 100;
    }

    return {
      currentPeriodInvoices: currentPeriodCount,
      totalSpending,
      spendingTrend: Number(spendingTrend.toFixed(1)),
      totalInvoices,
    };
  }

  private generateFacturaCode(prefix: 'FAC' | 'OCR'): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  private generateProductoCode(): string {
    return `PROD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  private async resolveOrCreateProducto(
    tx: Prisma.TransactionClient,
    nombre: string,
    precioUnitario: number,
  ) {
    const existing = await tx.producto.findFirst({
      where: { nombre },
    });

    if (existing) {
      return existing;
    }

    return tx.producto.create({
      data: {
        nombre,
        codigo: this.generateProductoCode(),
        precioUnitario,
      },
    });
  }
}
