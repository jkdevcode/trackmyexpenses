import {
  BadRequestException,
  Controller,
  Post,
  Get,
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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from 'nestjs-zod';

import { GetFacturasQueryDto } from './dto/get-facturas-query.dto';
import { ConfirmFacturaDto } from './dto/confirm-factura.dto';
import { FacturaOcrService } from './factura-ocr.service';
import type { Request as ExpressRequest } from 'express';

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
  @UsePipes(ZodValidationPipe)
  async create(@Request() req: RequestWithUser, @Body() dto: CreateFacturaDto) {
    return this.facturaService.create(req.user.id, dto);
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

  @Post('ocr')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Se requiere una imagen (field: image)');
    }

    if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
      throw new BadRequestException(
        'Solo se permiten imagenes (JPEG, PNG, WEBP)',
      );
    }

    return this.facturaOcrService.processImage(file);
  }

  @Post('ocr/confirmar')
  @UsePipes(ZodValidationPipe)
  async confirmarFactura(
    @Request() req: RequestWithUser,
    @Body() dto: ConfirmFacturaDto,
  ) {
    return this.facturaOcrService.confirmarFactura(req.user.id, dto);
  }
}
