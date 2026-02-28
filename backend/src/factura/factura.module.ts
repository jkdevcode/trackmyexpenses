import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FacturaOcrService } from './factura-ocr.service';
import { ImageProcessorService } from './image-processor.service';
import { TextParserService } from './text-parser.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [FacturaController],
  providers: [
    FacturaService,
    FacturaOcrService,
    ImageProcessorService,
    TextParserService,
  ],
})
export class FacturaModule {}
