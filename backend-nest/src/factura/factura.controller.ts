import {
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
} from '@nestjs/common';
import { FacturaService } from './factura.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { AddProductoFacturaDto } from './dto/add-producto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from 'nestjs-zod';

import { GetFacturasQueryDto } from './dto/get-facturas-query.dto';

interface RequestWithUser extends Request {
  user: {
    id: number;
  };
}

@Controller('facturas')
@UseGuards(JwtAuthGuard)
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) {}

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

  @Post(':id/productos')
  @UsePipes(ZodValidationPipe)
  async addProducto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddProductoFacturaDto,
    @Request() req: RequestWithUser,
  ) {
    return this.facturaService.addProducto(req.user.id, id, dto);
  }
}
