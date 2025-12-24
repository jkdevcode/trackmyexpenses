import { Controller, Post, Get, Body, UseGuards, Request, UsePipes, Param, ParseIntPipe } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { AddProductoFacturaDto } from './dto/add-producto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('facturas')
@UseGuards(JwtAuthGuard)
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) {}

  @Post()
  @UsePipes(ZodValidationPipe)
  async create(@Request() req: any, @Body() dto: CreateFacturaDto) {
    return this.facturaService.create(req.user.id, dto);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.facturaService.findAll(req.user.id);
  }

  @Post(':id/productos')
  @UsePipes(ZodValidationPipe)
  async addProducto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddProductoFacturaDto,
    @Request() req: any,
  ) {
    return this.facturaService.addProducto(req.user.id, id, dto);
  }
}
