import { Module } from '@nestjs/common';
import { FacturaOcrService } from './factura-ocr.service';
import { FacturaOcrController } from './factura-ocr.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [FacturaOcrController],
  providers: [FacturaOcrService],
})
export class FacturaOcrModule {}
