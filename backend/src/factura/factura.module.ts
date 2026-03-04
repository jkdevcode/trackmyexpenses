import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FacturaOcrService } from './factura-ocr.service';
import { ImageProcessorService } from './image-processor.service';
import { TextParserService } from './text-parser.service';
import { FACTURA_REPOSITORY } from './factura.repository.port';
import { PrismaFacturaRepository } from './prisma-factura.repository';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [FacturaController],
  providers: [
    FacturaService,
    {
      provide: FACTURA_REPOSITORY,
      useClass: PrismaFacturaRepository,
    },
    FacturaOcrService,
    ImageProcessorService,
    TextParserService,
  ],
})
export class FacturaModule {}
