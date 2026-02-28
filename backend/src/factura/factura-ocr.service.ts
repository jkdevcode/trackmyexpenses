import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createWorker, Worker } from 'tesseract.js';
import { RequestContext } from '../common/context/request-context';
import { ConfirmFacturaDto } from './dto/confirm-factura.dto';
import { ScanResponseDto } from './dto/scan-response.dto';
import { FacturaService } from './factura.service';
import { ImageProcessorService } from './image-processor.service';
import { TextParserService } from './text-parser.service';

@Injectable()
export class FacturaOcrService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FacturaOcrService.name);
  private worker: Worker | null = null;

  constructor(
    private readonly facturaService: FacturaService,
    private readonly imageProcessor: ImageProcessorService,
    private readonly textParser: TextParserService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Tesseract worker');
    try {
      this.worker = await createWorker('spa+eng');
    } catch (error: unknown) {
      this.logger.error('Failed to initialize Tesseract worker', error);
    }
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  async processImage(file: Express.Multer.File): Promise<ScanResponseDto> {
    try {
      const processedBuffer = await this.imageProcessor.process(file.buffer);
      const rawText = await this.extractText(processedBuffer);
      const parsedResult = await this.textParser.parseAndEnrich(rawText);

      return {
        rawText,
        parsed: parsedResult.parsed,
        usedFallbackParser: parsedResult.usedFallbackParser,
      };
    } catch (error: unknown) {
      this.logger.error({
        msg: 'Error processing OCR image',
        requestId: RequestContext.getRequestId(),
        error,
      });
      throw new InternalServerErrorException(
        'Error procesando la imagen de la factura',
      );
    }
  }

  async confirmarFactura(userId: number, dto: ConfirmFacturaDto) {
    return this.facturaService.createFromOcr(userId, dto);
  }

  private async extractText(buffer: Buffer): Promise<string> {
    if (!this.worker) {
      await this.onModuleInit();
    }

    const result = await this.worker!.recognize(buffer);
    return result.data.text;
  }
}
