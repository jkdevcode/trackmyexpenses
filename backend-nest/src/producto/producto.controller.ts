import { Controller, Post, Get, Body, UseGuards, UsePipes } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('productos')
@UseGuards(JwtAuthGuard)
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post()
  @UsePipes(ZodValidationPipe)
  async create(@Body() dto: CreateProductoDto) {
    return this.productoService.create(dto);
  }

  @Get()
  async findAll() {
    return this.productoService.findAll();
  }
}
