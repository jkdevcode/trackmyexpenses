import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UsePipes,
  Request,
} from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from 'nestjs-zod';
import type { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
  };
}

@Controller('productos')
@UseGuards(JwtAuthGuard)
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post()
  @UsePipes(ZodValidationPipe)
  async create(@Request() req: RequestWithUser, @Body() dto: CreateProductoDto) {
    return this.productoService.create(req.user.id, dto);
  }

  @Get()
  async findAll(@Request() req: RequestWithUser) {
    return this.productoService.findAll(req.user.id);
  }
}
