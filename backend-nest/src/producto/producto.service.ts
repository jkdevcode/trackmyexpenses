import { Injectable, InternalServerErrorException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';

@Injectable()
export class ProductoService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductoDto) {
    try {
      // Check if code exists
      const exists = await this.prisma.producto.findUnique({
        where: { codigo: dto.codigo },
      });

      if (exists) {
        throw new ConflictException('El código del producto ya existe');
      }

      const producto = await this.prisma.producto.create({
        data: {
          codigo: dto.codigo,
          nombre: dto.nombre,
          precioUnitario: dto.precioUnitario,
        },
      });

      return {
        status: 201,
        message: 'Producto creado exitosamente',
        producto,
      };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      console.error('Error al crear producto:', error);
      throw new InternalServerErrorException('Error al crear producto');
    }
  }

  async findAll() {
    try {
      const productos = await this.prisma.producto.findMany({
        orderBy: { nombre: 'asc' },
      });

      return {
        status: 200,
        message: 'Productos obtenidos exitosamente',
        productos,
        total: productos.length,
      };
    } catch (error) {
       console.error('Error al obtener productos:', error);
       throw new InternalServerErrorException('Error al obtener productos');
    }
  }

  async findOne(id: number) {
     const producto = await this.prisma.producto.findUnique({ where: { id } });
     if (!producto) throw new NotFoundException('Producto no encontrado');
     return producto;
  }
}
