import {
  Injectable,
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

/**
 * Normalizes raw Tesseract OCR output before it is sent to the AI parser.
 *
 * Tesseract produces variable-width whitespace columns, mixed line endings,
 * and box-drawing noise characters that degrade AI extraction quality.
 * This function collapses them into clean, line-oriented text.
 */
function normalizeOcrText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/ {2,}/g, '\t')
    .replace(/[|_~#—]{2,}/g, '')
    .split('\n')
    .filter((line) => /[a-zA-Z0-9]/.test(line))
    .join('\n')
    .trim();
}

@Injectable()
export class FacturaOcrService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FacturaOcrService.name);
  private worker: Worker | null = null;
  /** Shared promise that serializes concurrent initialization calls. */
  private initPromise: Promise<void> | null = null;

  constructor(
    private readonly facturaService: FacturaService,
    private readonly imageProcessor: ImageProcessorService,
    private readonly textParser: TextParserService,
  ) {}

  async onModuleInit() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      this.logger.log('Initializing Tesseract worker');
      try {
        this.worker = await createWorker('spa+eng');
      } catch (error: unknown) {
        this.initPromise = null; // allow retry on next request
        this.logger.error('Failed to initialize Tesseract worker', error);
      }
    })();
    return this.initPromise;
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  async processImage(
    file: Express.Multer.File,
    userId?: number,
  ): Promise<ScanResponseDto> {
    let rawText = '';
    let processedBuffer: Buffer;

    try {
      processedBuffer = await this.imageProcessor.process(file.buffer);
    } catch (error: unknown) {
      this.logger.error({
        msg: 'Error processing image buffer',
        requestId: RequestContext.getRequestId(),
        error,
      });
      return {
        rawText,
        parsed: {
          productos: [],
          notes: ['processing failed'],
          source: 'error',
        },
        usedFallbackParser: true,
      };
    }

    const base64 = processedBuffer.toString('base64');

    // 1. PRIMARY: AI with image
    try {
      const aiResult = await this.textParser.parseWithAI({
        imageBase64: base64,
      });

      if (aiResult?.productos?.length > 0) {
        const parsed = await this.textParser.finalizeParsedData(
          aiResult,
          undefined,
          userId,
        );
        return {
          rawText,
          parsed: { ...parsed, source: 'ai-image' },
          usedFallbackParser: false,
        };
      }
    } catch (error: unknown) {
      this.logger.warn('Image AI failed, falling back to OCR');
    }

    // 2. FALLBACK: OCR + text
    try {
      rawText = await this.extractText(processedBuffer);
      const cleanText = normalizeOcrText(rawText);
      const parsedResult = await this.textParser.parseAndEnrich(
        cleanText,
        userId,
      );
      return {
        rawText,
        parsed: { ...parsedResult.parsed, source: 'ocr-fallback' },
        usedFallbackParser: parsedResult.usedFallbackParser,
      };
    } catch (error: unknown) {
      this.logger.error({
        msg: 'Error processing OCR image',
        requestId: RequestContext.getRequestId(),
        error,
      });

      return {
        rawText,
        parsed: {
          productos: [],
          notes: ['processing failed'],
          source: 'error',
        },
        usedFallbackParser: true,
      };
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
