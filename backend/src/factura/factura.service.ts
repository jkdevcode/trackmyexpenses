import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { AddProductoFacturaDto } from './dto/add-producto.dto';
import { ConfirmFacturaDto } from './dto/confirm-factura.dto';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { Prisma } from '@prisma/client';
import { Logger } from 'nestjs-pino';
import { PeriodFilter } from './factura.types';
import { RequestContext } from '../common/context/request-context';

const FACTURA_LIST_SELECT = {
  id: true,
  codigoFactura: true,
  metodoPago: true,
  lugarCompra: true,
  nitProveedor: true,
  fechaHoraCompra: true,
  totalPagar: true,
  usuarioId: true,
} as const;

type FacturaStats = {
  currentPeriodInvoices: number;
  totalSpending: number;
  spendingTrend: number;
  totalInvoices: number;
};

type CreateFacturaItemInput = {
  productoId: number;
  cantidad: number;
  descuento?: number;
  unidad?: string;
};

type CreateFacturaInput = {
  metodoPago: CreateFacturaDto['metodoPago'];
  lugarCompra: string;
  nitProveedor?: string;
  fechaHoraCompra?: Date;
  items: CreateFacturaItemInput[];
};

@Injectable()
export class FacturaService {
  constructor(
    private prisma: PrismaService,
    private logger: Logger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(userId: number, dto: CreateFacturaDto) {
    try {
      const factura = await this.prisma.$transaction((tx) =>
        this.createFacturaWithItemsTx(
          tx,
          userId,
          {
            metodoPago: dto.metodoPago,
            lugarCompra: dto.lugarCompra || 'Comercio Desconocido',
            nitProveedor: dto.nitProveedor,
            fechaHoraCompra: dto.fechaHoraCompra
              ? new Date(dto.fechaHoraCompra)
              : undefined,
            items: dto.items,
          },
          'FAC',
        ),
      );

      return {
        status: 201,
        message: 'Factura creada exitosamente',
        factura,
      };
    } catch (error: unknown) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error({
        msg: 'Error al crear factura',
        requestId: RequestContext.getRequestId(),
        error,
      });
      throw new InternalServerErrorException('Error al crear factura');
    }
  }

  async createFromOcr(userId: number, dto: ConfirmFacturaDto) {
    try {
      const factura = await this.prisma.$transaction(async (tx) => {
        const input = await this.buildCreateInputFromOcrTx(tx, dto);
        return this.createFacturaWithItemsTx(tx, userId, input, 'OCR');
      });

      return {
        status: 201,
        message: 'Factura OCR confirmada exitosamente',
        data: { factura },
      };
    } catch (error: unknown) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error({
        msg: 'Error al crear factura desde OCR',
        requestId: RequestContext.getRequestId(),
        error,
      });
      throw new InternalServerErrorException('Error al confirmar factura');
    }
  }

  async findAll(
    userId: number,
    period: PeriodFilter = 'month',
    page = 1,
    limit = 20,
  ) {
    try {
      const { startDate, endDate, prevStartDate, prevEndDate } =
        this.getPeriodWindow(period);

      const where = {
        usuarioId: userId,
        fechaHoraCompra: {
          gte: startDate,
          lte: endDate,
        },
      };

      const skip = (page - 1) * limit;

      const [facturas, total, stats] = await Promise.all([
        this.prisma.factura.findMany({
          where,
          orderBy: {
            fechaHoraCompra: 'desc',
          },
          skip,
          take: limit,
          select: FACTURA_LIST_SELECT,
        }),
        this.prisma.factura.count({ where }),
        this.calculateStats(
          userId,
          startDate,
          endDate,
          prevStartDate,
          prevEndDate,
        ),
      ]);

      return {
        status: 200,
        message: 'Facturas obtenidas exitosamente',
        data: facturas,
        facturas,
        pagination: {
          page,
          limit,
          total,
        },
        stats,
      };
    } catch (error: unknown) {
      this.logger.error({
        msg: 'Error al obtener facturas',
        requestId: RequestContext.getRequestId(),
        error,
      });
      throw new InternalServerErrorException('Error al obtener facturas');
    }
  }

  async findOne(userId: number, facturaId: number) {
    try {
      const factura = await this.prisma.factura.findFirst({
        where: {
          id: facturaId,
          usuarioId: userId,
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
            },
          },
          productos: {
            include: {
              producto: {
                select: {
                  id: true,
                  nombre: true,
                  precioUnitario: true,
                },
              },
            },
          },
        },
      });

      if (!factura) {
        throw new NotFoundException('Factura no encontrada');
      }

      return {
        status: 200,
        message: 'Factura obtenida exitosamente',
        factura,
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error({
        msg: 'Error al obtener detalle de factura',
        requestId: RequestContext.getRequestId(),
        error,
      });
      throw new InternalServerErrorException('Error al obtener factura');
    }
  }

  async getStats(userId: number, period: PeriodFilter = 'month') {
    const cacheKey = `factura:stats:${userId}:${period}`;
    const cached = await this.cacheManager.get<FacturaStats>(cacheKey);
    if (cached) {
      return {
        status: 200,
        message: 'Estadisticas obtenidas exitosamente (cache)',
        stats: cached,
      };
    }

    const { startDate, endDate, prevStartDate, prevEndDate } =
      this.getPeriodWindow(period);

    const stats = await this.calculateStats(
      userId,
      startDate,
      endDate,
      prevStartDate,
      prevEndDate,
    );

    await this.cacheManager.set(cacheKey, stats, 600000);

    return {
      status: 200,
      message: 'Estadisticas obtenidas exitosamente',
      stats,
    };
  }

  async addProducto(
    userId: number,
    facturaId: number,
    dto: AddProductoFacturaDto,
  ) {
    const factura = await this.prisma.factura.findFirst({
      where: {
        id: facturaId,
        usuarioId: userId,
      },
      select: { id: true },
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    const producto = await this.prisma.producto.findUnique({
      where: { id: dto.productoId },
      select: { id: true, precioUnitario: true },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    const precioUnitario = Number(producto.precioUnitario);
    const descuento = dto.descuento || 0;
    const precioConDescuento = precioUnitario * (1 - descuento / 100);
    const precioTotal = precioConDescuento * dto.cantidad;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const fp = await tx.facturaProducto.create({
          data: {
            facturaId,
            productoId: dto.productoId,
            cantidad: dto.cantidad,
            descuento: new Prisma.Decimal(descuento),
            precioTotal: new Prisma.Decimal(precioTotal),
          },
          select: {
            id: true,
            facturaId: true,
            productoId: true,
            cantidad: true,
            descuento: true,
            precioTotal: true,
          },
        });

        const updatedFactura = await tx.factura.update({
          where: { id: facturaId },
          data: {
            totalPagar: { increment: precioTotal },
          },
          select: {
            id: true,
            codigoFactura: true,
            totalPagar: true,
            productos: {
              select: {
                id: true,
                productoId: true,
                cantidad: true,
                descuento: true,
                precioTotal: true,
                producto: {
                  select: {
                    id: true,
                    codigo: true,
                    nombre: true,
                    precioUnitario: true,
                  },
                },
              },
            },
          },
        });

        return { fp, updatedFactura };
      });

      return {
        status: 201,
        message: 'Producto agregado a factura exitosamente',
        data: result,
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('El producto ya esta en la factura');
      }

      this.logger.error({
        msg: 'Error agregando producto',
        requestId: RequestContext.getRequestId(),
        error,
      });

      throw new InternalServerErrorException(
        'Error al agregar producto a factura',
      );
    }
  }

  private async createFacturaWithItemsTx(
    tx: Prisma.TransactionClient,
    userId: number,
    input: CreateFacturaInput,
    codePrefix: 'FAC' | 'OCR',
  ) {
    this.validateItems(input.items);

    const productIds = [...new Set(input.items.map((item) => item.productoId))];

    const products = await tx.producto.findMany({
      where: { id: { in: productIds } },
      select: { id: true, precioUnitario: true },
    });

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((product) => product.id));
      const missingIds = productIds.filter((id) => !foundIds.has(id));

      throw new NotFoundException(
        `Productos no encontrados: ${missingIds.join(', ')}`,
      );
    }

    const productById = new Map(products.map((product) => [product.id, product]));

    const detalles = input.items.map((item) => {
      const product = productById.get(item.productoId)!;
      const precioUnitario = Number(product.precioUnitario);
      const descuento = item.descuento ?? 0;
      const subtotal = precioUnitario * item.cantidad;
      const descuentoAplicado = subtotal * (descuento / 100);
      const precioTotal = this.roundCurrency(subtotal - descuentoAplicado);

      return {
        ...item,
        descuento,
        precioTotal,
      };
    });

    const totalPagar = this.roundCurrency(
      detalles.reduce((acc, item) => acc + item.precioTotal, 0),
    );

    const factura = await tx.factura.create({
      data: {
        usuarioId: userId,
        codigoFactura: this.generateFacturaCode(codePrefix),
        metodoPago: input.metodoPago,
        lugarCompra: input.lugarCompra,
        nitProveedor: input.nitProveedor,
        fechaHoraCompra: input.fechaHoraCompra ?? new Date(),
        totalPagar: new Prisma.Decimal(totalPagar),
      },
    });

    await Promise.all(
      detalles.map((item) =>
        tx.facturaProducto.create({
          data: {
            facturaId: factura.id,
            productoId: item.productoId,
            cantidad: item.cantidad,
            unidad: item.unidad,
            descuento: new Prisma.Decimal(item.descuento),
            precioTotal: new Prisma.Decimal(item.precioTotal),
          },
        }),
      ),
    );

    return tx.factura.findUniqueOrThrow({
      where: { id: factura.id },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
        productos: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                precioUnitario: true,
              },
            },
          },
        },
      },
    });
  }

  private async buildCreateInputFromOcrTx(
    tx: Prisma.TransactionClient,
    dto: ConfirmFacturaDto,
  ): Promise<CreateFacturaInput> {
    const items: CreateFacturaItemInput[] = [];

    for (const item of dto.productos) {
      const nombreDetectado = item.nombreDetectado?.trim().toUpperCase();
      const cantidad = Number(item.cantidadDetectada);
      const descuento = Number(item.descuentoDetectado || 0);
      const precioUnitario = Number(item.precioUnitario);

      if (!nombreDetectado) {
        throw new BadRequestException(
          'Cada item OCR debe tener nombreDetectado',
        );
      }

      if (!Number.isFinite(cantidad) || cantidad <= 0) {
        throw new BadRequestException('La cantidad de cada item debe ser > 0');
      }

      if (!Number.isFinite(descuento) || descuento < 0 || descuento > 100) {
        throw new BadRequestException(
          'El descuento de cada item debe estar entre 0 y 100',
        );
      }

      let producto = await tx.producto.findFirst({
        where: { nombre: nombreDetectado },
        select: { id: true },
      });

      if (!producto) {
        if (!Number.isFinite(precioUnitario) || precioUnitario <= 0) {
          throw new BadRequestException(
            'Items OCR sin producto existente requieren precioUnitario valido',
          );
        }

        producto = await tx.producto.create({
          data: {
            nombre: nombreDetectado,
            codigo: this.generateProductoCode(),
            precioUnitario: new Prisma.Decimal(precioUnitario),
          },
          select: { id: true },
        });
      }

      items.push({
        productoId: producto.id,
        cantidad,
        descuento,
        unidad: item.unidadDetectada || 'u',
      });
    }

    return {
      metodoPago: dto.factura.metodoPago,
      lugarCompra: dto.factura.lugarCompra,
      nitProveedor: dto.factura.nitProveedor,
      fechaHoraCompra: new Date(dto.factura.fechaHoraCompra),
      items,
    };
  }

  private validateItems(items: CreateFacturaItemInput[]) {
    if (!items || items.length === 0) {
      throw new BadRequestException('No se permite crear factura sin items');
    }

    const productIds = new Set<number>();

    for (const item of items) {
      if (!Number.isInteger(item.productoId) || item.productoId <= 0) {
        throw new BadRequestException('productoId invalido en items');
      }

      if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
        throw new BadRequestException('cantidad invalida en items');
      }

      if (
        item.descuento !== undefined &&
        (item.descuento < 0 || item.descuento > 100)
      ) {
        throw new BadRequestException(
          'descuento invalido en items (debe estar entre 0 y 100)',
        );
      }

      if (productIds.has(item.productoId)) {
        throw new BadRequestException(
          `No se permiten items repetidos del producto ${item.productoId}`,
        );
      }

      productIds.add(item.productoId);
    }
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private getPeriodWindow(period: PeriodFilter) {
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();
    const prevStartDate = new Date();
    const prevEndDate = new Date();

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    switch (period) {
      case 'day':
        prevStartDate.setDate(now.getDate() - 1);
        prevStartDate.setHours(0, 0, 0, 0);
        prevEndDate.setDate(now.getDate() - 1);
        prevEndDate.setHours(23, 59, 59, 999);
        break;
      case 'week': {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);

        prevStartDate.setTime(startDate.getTime());
        prevStartDate.setDate(startDate.getDate() - 7);
        prevEndDate.setTime(prevStartDate.getTime());
        prevEndDate.setDate(prevStartDate.getDate() + 6);
        prevEndDate.setHours(23, 59, 59, 999);
        break;
      }
      case 'year':
        startDate.setMonth(0, 1);

        prevStartDate.setFullYear(now.getFullYear() - 1, 0, 1);
        prevStartDate.setHours(0, 0, 0, 0);
        prevEndDate.setFullYear(now.getFullYear() - 1, 11, 31);
        prevEndDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
      default:
        startDate.setDate(1);

        prevStartDate.setMonth(now.getMonth() - 1, 1);
        prevStartDate.setHours(0, 0, 0, 0);
        prevEndDate.setDate(0);
        prevEndDate.setHours(23, 59, 59, 999);
        break;
    }

    return { startDate, endDate, prevStartDate, prevEndDate };
  }

  private async calculateStats(
    userId: number,
    startDate: Date,
    endDate: Date,
    prevStartDate: Date,
    prevEndDate: Date,
  ): Promise<FacturaStats> {
    const [
      currentPeriodCount,
      currentPeriodAggregate,
      totalInvoices,
      prevFacturasAggregate,
    ] = await Promise.all([
      this.prisma.factura.count({
        where: {
          usuarioId: userId,
          fechaHoraCompra: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      this.prisma.factura.aggregate({
        where: {
          usuarioId: userId,
          fechaHoraCompra: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          totalPagar: true,
        },
      }),
      this.prisma.factura.count({
        where: { usuarioId: userId },
      }),
      this.prisma.factura.aggregate({
        where: {
          usuarioId: userId,
          fechaHoraCompra: {
            gte: prevStartDate,
            lte: prevEndDate,
          },
        },
        _sum: {
          totalPagar: true,
        },
      }),
    ]);

    const totalSpending = Number(currentPeriodAggregate._sum.totalPagar) || 0;
    const prevTotalSpending =
      Number(prevFacturasAggregate._sum.totalPagar) || 0;

    let spendingTrend = 0;
    if (prevTotalSpending > 0) {
      spendingTrend =
        ((totalSpending - prevTotalSpending) / prevTotalSpending) * 100;
    } else if (totalSpending > 0) {
      spendingTrend = 100;
    }

    return {
      currentPeriodInvoices: currentPeriodCount,
      totalSpending,
      spendingTrend: Number(spendingTrend.toFixed(1)),
      totalInvoices,
    };
  }

  private generateFacturaCode(prefix: 'FAC' | 'OCR'): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  private generateProductoCode(): string {
    return `PROD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
}
