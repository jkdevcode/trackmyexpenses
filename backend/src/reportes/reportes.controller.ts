import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  UsePipes,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportesService } from './reportes.service';
import { ZodValidationPipe } from 'nestjs-zod';
import type { Request as ExpressRequest, Response } from 'express';
import { GetReportesQueryDto } from './dto/get-reportes-query.dto';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
  };
}

@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('facturas')
  @UsePipes(ZodValidationPipe)
  async generarReporteFacturas(
    @Request() req: RequestWithUser,
    @Query() query: GetReportesQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pdfBuffer = await this.reportesService.generateFacturasReport(
      req.user.id,
      query,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte.pdf');

    res.end(pdfBuffer);
  }

  @Get('facturas/check')
  @UsePipes(ZodValidationPipe)
  async checkReporteFacturas(
    @Request() req: RequestWithUser,
    @Query() query: GetReportesQueryDto,
  ) {
    return this.reportesService.checkFacturasReport(req.user.id, query);
  }
}
