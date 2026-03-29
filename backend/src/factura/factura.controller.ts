import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request as ExpressRequest } from 'express';
import { ZodValidationPipe } from 'nestjs-zod';
import { ZodError, type ZodIssue } from 'zod';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  MAX_UPLOAD_FILE_SIZE,
  imageFileInterceptorOptions,
} from '../common/upload/upload-options';
import type { AppErrorDetail } from '../common/errors/app.error';
import { AddProductoFacturaDto } from './dto/add-producto.dto';
import { ConfirmFacturaDto } from './dto/confirm-factura.dto';
import { CreateFacturaDto } from './dto/create-factura.dto';
import {
  CreateOcrFacturaDto,
  createOcrFacturaSchema,
} from './dto/create-ocr-factura.dto';
import { GetFacturasQueryDto } from './dto/get-facturas-query.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { FACTURA_ERROR_CODES } from './errors/factura-error-codes';
import { FacturaDomainValidationError } from './factura.domain';
import { FacturaOcrService } from './factura-ocr.service';
import { FacturaService } from './factura.service';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
  };
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function buildDetail(
  code: string,
  field?: string,
  meta?: Record<string, unknown>,
): AppErrorDetail[] {
  return [
    {
      code,
      ...(field ? { field } : {}),
      ...(meta ? { meta } : {}),
    },
  ];
}

function mapIssuePathToField(path: (string | number)[]): string | undefined {
  if (path.length === 0) {
    return undefined;
  }

  return path.reduce<string>((field, segment) => {
    if (typeof segment === 'number') {
      return `${field}[${segment}]`;
    }

    return field ? `${field}.${segment}` : segment;
  }, '');
}

function mapIssueToCode(issue: ZodIssue): string {
  const [root, second, third] = issue.path;

  if (root === 'moneda') {
    return FACTURA_ERROR_CODES.MONEDA_INVALID;
  }

  if (root === 'tasaCambio') {
    return FACTURA_ERROR_CODES.TASA_CAMBIO_INVALID;
  }

  if (root === 'items' && typeof second === 'number') {
    if (third === 'nombreDetectado') {
      return FACTURA_ERROR_CODES.OCR_ITEM_NAME_MISSING;
    }

    if (third === 'precioUnitario') {
      return FACTURA_ERROR_CODES.OCR_ITEM_PRECIO_INVALID;
    }

    if (third === 'cantidadDetectada') {
      return FACTURA_ERROR_CODES.OCR_ITEM_CANTIDAD_INVALID;
    }

    if (third === 'descuentoDetectado') {
      return FACTURA_ERROR_CODES.ITEM_DESCUENTO_INVALID;
    }
  }

  return FACTURA_ERROR_CODES.OCR_INVALID_PAYLOAD;
}

function mapZodErrorToDetails(error: ZodError): AppErrorDetail[] {
  const details = error.issues.map((issue) => {
    const safePath = issue.path.filter(
      (key): key is string | number => typeof key !== 'symbol',
    );

    const field = mapIssuePathToField(safePath);

    return {
      code: mapIssueToCode(issue),
      ...(field ? { field } : {}),
      meta: { reason: issue.message },
    };
  });

  return details.length > 0
    ? details
    : buildDetail(FACTURA_ERROR_CODES.OCR_INVALID_PAYLOAD);
}

/* function mapZodErrorToDetails(error: ZodError): AppErrorDetail[] {
  const details = error.issues.map((issue) => ({
    code: mapIssueToCode(issue),
    ...(mapIssuePathToField(issue.path)
      ? { field: mapIssuePathToField(issue.path) }
      : {}),
    meta: { reason: issue.message },
  }));

  return details.length > 0
    ? details
    : buildDetail(FACTURA_ERROR_CODES.OCR_INVALID_PAYLOAD);
} */

@Controller('facturas')
@UseGuards(JwtAuthGuard)
export class FacturaController {
  constructor(
    private readonly facturaService: FacturaService,
    private readonly facturaOcrService: FacturaOcrService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', imageFileInterceptorOptions))
  @UsePipes(ZodValidationPipe)
  async create(
    @Request() req: RequestWithUser,
    @Body() dto: CreateFacturaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      if (file.size > MAX_UPLOAD_FILE_SIZE) {
        throw new FacturaDomainValidationError(
          FACTURA_ERROR_CODES.UPLOAD_FILE_TOO_LARGE,
          buildDetail(FACTURA_ERROR_CODES.UPLOAD_FILE_TOO_LARGE, 'file', {
            maxBytes: MAX_UPLOAD_FILE_SIZE,
          }),
        );
      }

      if (!file.mimetype.match(/^image\/(jpeg|png)$/)) {
        throw new FacturaDomainValidationError(
          FACTURA_ERROR_CODES.UPLOAD_FILE_TYPE_INVALID,
          buildDetail(FACTURA_ERROR_CODES.UPLOAD_FILE_TYPE_INVALID, 'file'),
        );
      }
    }

    return this.facturaService.create(req.user.id, dto, file);
  }

  @Get()
  @UsePipes(ZodValidationPipe)
  async findAll(
    @Request() req: RequestWithUser,
    @Query() query: GetFacturasQueryDto,
  ) {
    return this.facturaService.findAll(
      req.user.id,
      query.period,
      query.page,
      query.limit,
    );
  }

  @Get('stats')
  @UsePipes(ZodValidationPipe)
  async stats(
    @Request() req: RequestWithUser,
    @Query() query: GetFacturasQueryDto,
  ) {
    return this.facturaService.getStats(req.user.id, query.period);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.facturaService.findOne(req.user.id, id);
  }

  @Post(':id/productos')
  @UsePipes(ZodValidationPipe)
  async addProducto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddProductoFacturaDto,
    @Request() req: RequestWithUser,
  ) {
    return this.facturaService.addProducto(req.user.id, id, dto);
  }

  @Put(':id')
  @UsePipes(ZodValidationPipe)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFacturaDto,
    @Request() req: RequestWithUser,
  ) {
    return this.facturaService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.facturaService.remove(req.user.id, id);
  }

  @Post('ocr')
  @UseInterceptors(FileInterceptor('image', imageFileInterceptorOptions))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: RequestWithUser,
  ) {
    if (!file) {
      throw new FacturaDomainValidationError(
        FACTURA_ERROR_CODES.OCR_IMAGE_REQUIRED,
        buildDetail(FACTURA_ERROR_CODES.OCR_IMAGE_REQUIRED, 'image'),
      );
    }

    if (file.size > MAX_UPLOAD_FILE_SIZE) {
      throw new FacturaDomainValidationError(
        FACTURA_ERROR_CODES.UPLOAD_FILE_TOO_LARGE,
        buildDetail(FACTURA_ERROR_CODES.UPLOAD_FILE_TOO_LARGE, 'image', {
          maxBytes: MAX_UPLOAD_FILE_SIZE,
        }),
      );
    }

    if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
      throw new FacturaDomainValidationError(
        FACTURA_ERROR_CODES.UPLOAD_FILE_TYPE_INVALID,
        buildDetail(FACTURA_ERROR_CODES.UPLOAD_FILE_TYPE_INVALID, 'image'),
      );
    }

    return this.facturaOcrService.processImage(file, req.user.id);
  }

  @Post('ocr/confirmar')
  @UsePipes(ZodValidationPipe)
  async confirmarFactura(
    @Request() req: RequestWithUser,
    @Body() dto: ConfirmFacturaDto,
  ) {
    return this.facturaOcrService.confirmarFactura(req.user.id, dto);
  }

  @Post('ocr/create')
  @UseInterceptors(FileInterceptor('file', imageFileInterceptorOptions))
  async createWithOcr(
    @Request() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: Record<string, unknown>,
  ) {
    let parsedItems: unknown[] = [];

    if (!body.items) {
      throw new FacturaDomainValidationError(
        FACTURA_ERROR_CODES.OCR_ITEMS_REQUIRED,
        buildDetail(FACTURA_ERROR_CODES.OCR_ITEMS_REQUIRED, 'items'),
      );
    }

    if (typeof body.items === 'string') {
      let parsed: unknown;
      try {
        parsed = JSON.parse(body.items) as unknown;
      } catch {
        throw new FacturaDomainValidationError(
          FACTURA_ERROR_CODES.OCR_ITEMS_INVALID_JSON,
          buildDetail(FACTURA_ERROR_CODES.OCR_ITEMS_INVALID_JSON, 'items'),
        );
      }

      if (!isUnknownArray(parsed)) {
        throw new FacturaDomainValidationError(
          FACTURA_ERROR_CODES.OCR_ITEMS_INVALID_TYPE,
          buildDetail(FACTURA_ERROR_CODES.OCR_ITEMS_INVALID_TYPE, 'items'),
        );
      }

      parsedItems = parsed;
    } else if (isUnknownArray(body.items)) {
      parsedItems = body.items;
    } else {
      throw new FacturaDomainValidationError(
        FACTURA_ERROR_CODES.OCR_ITEMS_INVALID_TYPE,
        buildDetail(FACTURA_ERROR_CODES.OCR_ITEMS_INVALID_TYPE, 'items'),
      );
    }

    if (parsedItems.length === 0) {
      throw new FacturaDomainValidationError(
        FACTURA_ERROR_CODES.ITEMS_EMPTY,
        buildDetail(FACTURA_ERROR_CODES.ITEMS_EMPTY, 'items'),
      );
    }

    if (file) {
      if (file.size > MAX_UPLOAD_FILE_SIZE) {
        throw new FacturaDomainValidationError(
          FACTURA_ERROR_CODES.UPLOAD_FILE_TOO_LARGE,
          buildDetail(FACTURA_ERROR_CODES.UPLOAD_FILE_TOO_LARGE, 'file', {
            maxBytes: MAX_UPLOAD_FILE_SIZE,
          }),
        );
      }

      if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
        throw new FacturaDomainValidationError(
          FACTURA_ERROR_CODES.UPLOAD_FILE_TYPE_INVALID,
          buildDetail(FACTURA_ERROR_CODES.UPLOAD_FILE_TYPE_INVALID, 'file'),
        );
      }
    }

    const cleanPayload = {
      ...body,
      items: parsedItems,
      totalPagar: body.totalPagar ? Number(body.totalPagar) : undefined,
      tasaCambio: body.tasaCambio ? Number(body.tasaCambio) : undefined,
    };

    let dto: CreateOcrFacturaDto;
    try {
      dto = createOcrFacturaSchema.parse(cleanPayload);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new FacturaDomainValidationError(
          FACTURA_ERROR_CODES.OCR_INVALID_PAYLOAD,
          mapZodErrorToDetails(error),
        );
      }
      throw error;
    }

    return this.facturaService.createWithOcrAndFile(req.user.id, dto, file);
  }
}
