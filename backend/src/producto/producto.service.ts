import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { Logger } from 'nestjs-pino';
import { RequestContext } from '../common/context/request-context';
import { DomainConflictError } from '../common/errors/domain-conflict.error';
import { ProductoNotFoundError } from './errors/producto-not-found.error';

@Injectable()
export class ProductoService {
  constructor(
    private prisma: PrismaService,
    private logger: Logger,
  ) {}

  async create(userId: number, dto: CreateProductoDto) {
    try {
      const exists = await this.prisma.producto.findUnique({
        where: {
          codigo_usuarioId: {
            codigo: dto.codigo,
            usuarioId: userId,
          },
        },
      });

      if (exists) {
        throw new DomainConflictError('El codigo del producto ya existe');
      }

      const producto = await this.prisma.producto.create({
        data: {
          codigo: dto.codigo,
          nombre: dto.nombre,
          precioUnitario: dto.precioUnitario,
          usuarioId: userId,
        },
      });

      return {
        status: 201,
        message: 'Producto creado exitosamente',
        producto,
      };
    } catch (error: unknown) {
      if (error instanceof DomainConflictError) throw error;
      this.logger.error({
        msg: 'Error al crear producto',
        requestId: RequestContext.getRequestId(),
        error,
      });
      throw new InternalServerErrorException('Error al crear producto');
    }
  }

  async findAll(userId: number) {
    try {
      const productos = await this.prisma.producto.findMany({
        where: { usuarioId: userId },
        orderBy: { nombre: 'asc' },
      });

      return {
        status: 200,
        message: 'Productos obtenidos exitosamente',
        productos,
        total: productos.length,
      };
    } catch (error: unknown) {
      this.logger.error({
        msg: 'Error al obtener productos',
        requestId: RequestContext.getRequestId(),
        error,
      });
      throw new InternalServerErrorException('Error al obtener productos');
    }
  }

  async findOne(userId: number, id: number) {
    const producto = await this.prisma.producto.findFirst({
      where: { id, usuarioId: userId },
    });
    if (!producto) throw new ProductoNotFoundError('Producto no encontrado');
    return producto;
  }
}
