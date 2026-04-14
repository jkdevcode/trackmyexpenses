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
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiCookieAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
  };
}

@ApiTags('Products')
@ApiCookieAuth('token')
@Controller('productos')
@UseGuards(JwtAuthGuard)
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post()
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiCreatedResponse({ description: 'Product successfully created.' })
  @ApiBadRequestResponse({ description: 'Invalid product data provided.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid auth cookie.' })
  async create(
    @Request() req: RequestWithUser,
    @Body() dto: CreateProductoDto,
  ) {
    return this.productoService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all products' })
  @ApiOkResponse({ description: 'List of products retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid auth cookie.' })
  async findAll(@Request() req: RequestWithUser) {
    return this.productoService.findAll(req.user.id);
  }
}
