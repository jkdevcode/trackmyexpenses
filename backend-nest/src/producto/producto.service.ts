import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { Logger } from 'nestjs-pino';
import { RequestContext } from '../common/context/request-context';

@Injectable()
export class ProductoService {
  constructor(
    private prisma: PrismaService,
    private logger: Logger,
  ) {}

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
    } catch (error: unknown) {
      if (error instanceof ConflictException) throw error;
      this.logger.error({
        msg: 'Error al crear producto',
        requestId: RequestContext.getRequestId(),
        error,
      });
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
    } catch (error: unknown) {
       this.logger.error({
         msg: 'Error al obtener productos',
         requestId: RequestContext.getRequestId(),
         error,
       });
      throw new InternalServerErrorException('Error al obtener productos');
    }
  }

  async findOne(id: number) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }
}
