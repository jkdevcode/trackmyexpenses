import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createWorker, Worker } from 'tesseract.js';

@Injectable()
export class OcrService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OcrService.name);
  private worker: Worker | null = null;

  async onModuleInit() {
    this.logger.log('Initializing Tesseract Worker...');
    try {
      this.worker = await createWorker('spa+eng');
      this.logger.log('Tesseract Worker ready.');
    } catch (error: unknown) {
      this.logger.error('Failed to init Tesseract', error as any);
    }
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  async extractText(buffer: Buffer): Promise<string> {
    if (!this.worker) {
      await this.onModuleInit();
    }

    const result = await this.worker!.recognize(buffer);
    return result.data.text;
  }
}
