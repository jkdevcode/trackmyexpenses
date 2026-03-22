import {
  BadRequestException,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  UsePipes,
  Param,
  ParseIntPipe,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FacturaService } from './factura.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { AddProductoFacturaDto } from './dto/add-producto.dto';
import { CreateOcrFacturaDto } from './dto/create-ocr-factura.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from 'nestjs-zod';
import { UpdateFacturaDto } from './dto/update-factura.dto';

import { GetFacturasQueryDto } from './dto/get-facturas-query.dto';
import { ConfirmFacturaDto } from './dto/confirm-factura.dto';
import { FacturaOcrService } from './factura-ocr.service';
import type { Request as ExpressRequest } from 'express';
import {
  MAX_UPLOAD_FILE_SIZE,
  imageFileInterceptorOptions,
} from '../common/upload/upload-options';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
  };
}

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
        throw new BadRequestException('El archivo supera el limite de 5MB');
      }

      if (!file.mimetype.match(/^image\/(jpeg|png)$/)) {
        throw new BadRequestException('Solo se permiten imagenes (JPEG, PNG)');
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
      throw new BadRequestException('Se requiere una imagen (field: image)');
    }

    if (file.size > MAX_UPLOAD_FILE_SIZE) {
      throw new BadRequestException('El archivo supera el limite de 5MB');
    }

    if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
      throw new BadRequestException(
        'Solo se permiten imagenes (JPEG, PNG, WEBP)',
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
    @Body() body: any,
  ) {
    // 1. Log pre-parsing type for debugging
    console.log('OCR items type (raw):', typeof body.items);

    // 2. Manual parsing of items
    let parsedItems: any[] = [];

    if (!body.items) {
      throw new BadRequestException('El campo items es obligatorio');
    }

    if (typeof body.items === 'string') {
      try {
        parsedItems = JSON.parse(body.items);
      } catch (error) {
        throw new BadRequestException('JSON invalido en items');
      }
    } else if (Array.isArray(body.items)) {
      parsedItems = body.items;
    } else {
      throw new BadRequestException('items debe ser un array o un JSON string');
    }

    // 3. Log post-parsing type for debugging
    console.log('OCR items type (parsed):', typeof parsedItems);

    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      throw new BadRequestException('Debe haber al menos un item (array no vacio)');
    }

    // 4. Validate file
    if (file) {
      if (file.size > MAX_UPLOAD_FILE_SIZE) {
        throw new BadRequestException('El archivo supera el limite de 5MB');
      }

      if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
        throw new BadRequestException(
          'Solo se permiten imagenes (JPEG, PNG, WEBP)',
        );
      }
    }

    // 5. Build clean payload with numeric conversions and forward to service
    const cleanPayload = {
      ...body,
      items: parsedItems,
      totalPagar: body.totalPagar ? Number(body.totalPagar) : undefined,
      tasaCambio: body.tasaCambio ? Number(body.tasaCambio) : undefined,
    };

    return this.facturaService.createWithOcrAndFile(req.user.id, cleanPayload, file);
  }
}
