import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { FacturaOcrController } from './factura-ocr.controller';
import { FacturaOcrOrchestrator } from './factura-ocr-orchestrator.service';
import { ImageProcessorService } from './image-processor.service';
import { OcrService } from './ocr.service';
import { TextParserService } from './text-parser.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [FacturaOcrController],
  providers: [
    FacturaOcrOrchestrator,
    ImageProcessorService,
    OcrService,
    TextParserService,
  ],
})
export class FacturaOcrModule {}
