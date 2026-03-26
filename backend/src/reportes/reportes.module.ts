import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { PdfService } from './pdf.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReportesController],
  providers: [ReportesService, PdfService],
})
export class ReportesModule {}
