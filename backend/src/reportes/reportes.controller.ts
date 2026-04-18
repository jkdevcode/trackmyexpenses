import {
  applyDecorators,
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  UsePipes,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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

const PERIOD_VALUES = ['week', 'month', 'year', 'all', 'custom'] as const;

function ApiReportFilterQueries() {
  return applyDecorators(
    ApiQuery({
      name: 'period',
      required: false,
      enum: PERIOD_VALUES,
      description:
        'Shared filter period. Use `custom` with `startDate` and `endDate`, or `all` to generate a report for all invoices.',
      example: 'custom',
    }),
    ApiQuery({
      name: 'startDate',
      required: false,
      description: 'Required when `period=custom`. Format: `YYYY-MM-DD`.',
      example: '2026-04-01',
    }),
    ApiQuery({
      name: 'endDate',
      required: false,
      description: 'Required when `period=custom`. Format: `YYYY-MM-DD`.',
      example: '2026-04-09',
    }),
    ApiQuery({
      name: 'from',
      required: false,
      description:
        'Legacy start date parameter kept for backward compatibility. Format: `YYYY-MM-DD`.',
      example: '2026-04-01',
    }),
    ApiQuery({
      name: 'to',
      required: false,
      description:
        'Legacy end date parameter kept for backward compatibility. Format: `YYYY-MM-DD`.',
      example: '2026-04-09',
    }),
  );
}

@ApiTags('Reports')
@ApiCookieAuth('token')
@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('facturas')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Generate an invoice report PDF',
    description:
      'Builds a PDF report for the authenticated user using the shared period filter system. New clients should use `period`, `startDate`, and `endDate`; `from` and `to` remain available for backward compatibility.',
  })
  @ApiReportFilterQueries()
  @ApiProduces('application/pdf')
  @ApiOkResponse({
    description: 'PDF file generated for the selected invoice range.',
    headers: {
      'Content-Disposition': {
        description: 'Attachment filename header.',
        schema: {
          type: 'string',
          example: 'attachment; filename=reporte.pdf',
        },
      },
    },
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Missing filter parameters, invalid date format, or invalid custom range.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid auth cookie.',
  })
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
  @ApiOperation({
    summary: 'Check whether invoice data exists for a report',
    description:
      'Returns whether the authenticated user has invoice data for the selected filter range before requesting the PDF download.',
  })
  @ApiReportFilterQueries()
  @ApiOkResponse({
    description: 'Report data availability for the selected range.',
    schema: {
      example: {
        hasData: true,
        count: 12,
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Missing filter parameters, invalid date format, or invalid custom range.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid auth cookie.',
  })
  async checkReporteFacturas(
    @Request() req: RequestWithUser,
    @Query() query: GetReportesQueryDto,
  ) {
    return this.reportesService.checkFacturasReport(req.user.id, query);
  }
}
