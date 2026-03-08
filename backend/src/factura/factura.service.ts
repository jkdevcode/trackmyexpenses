import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { AddProductoFacturaDto } from './dto/add-producto.dto';
import { ConfirmFacturaDto } from './dto/confirm-factura.dto';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { Logger } from 'nestjs-pino';
import { PeriodFilter } from './factura.types';
import { RequestContext } from '../common/context/request-context';
import {
  assertValidFacturaItems,
  calculateDiscountedTotal,
  calculateFacturaTotal,
  calculateSpendingTrend,
  FacturaDomainValidationError,
  getPeriodWindow,
  normalizeAndValidateOcrItem,
} from './factura.domain';
import { FacturaNotFoundError } from './errors/factura-not-found.error';
import { DomainConflictError } from '../common/errors/domain-conflict.error';
import {
  FACTURA_REPOSITORY,
  FacturaRepositoryTx,
} from './factura.repository.port';
import type { FacturaRepository } from './factura.repository.port';
import type { MetodoPagoValue } from './factura.repository.port';

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
  metodoPago: MetodoPagoValue;
  lugarCompra: string;
  nitProveedor?: string;
  fechaHoraCompra?: Date;
  items: CreateFacturaItemInput[];
};

@Injectable()
export class FacturaService {
  constructor(
    @Inject(FACTURA_REPOSITORY) private readonly repo: FacturaRepository,
    private logger: Logger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(userId: number, dto: CreateFacturaDto) {
    try {
      const factura = await this.repo.transaction((tx) =>
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
        error instanceof FacturaNotFoundError
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
      const factura = await this.repo.transaction(async (tx) => {
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
        error instanceof FacturaNotFoundError
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
        getPeriodWindow(period);

      const [facturas, total, stats] = await Promise.all([
        this.repo.findFacturasByUserAndRange(
          userId,
          { startDate, endDate },
          page,
          limit,
        ),
        this.repo.countFacturasByUserAndRange(userId, { startDate, endDate }),
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
      const factura = await this.repo.findFacturaDetailByUser(
        userId,
        facturaId,
      );

      if (!factura) {
        throw new FacturaNotFoundError();
      }

      return {
        status: 200,
        message: 'Factura obtenida exitosamente',
        factura,
      };
    } catch (error: unknown) {
      if (error instanceof FacturaNotFoundError) {
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
      getPeriodWindow(period);

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
    const factura = await this.repo.findFacturaIdByUser(userId, facturaId);

    if (!factura) {
      throw new FacturaNotFoundError();
    }

    const producto = await this.repo.findProductoById(dto.productoId);

    if (!producto) {
      throw new FacturaNotFoundError('Producto no encontrado');
    }

    const precioUnitario = Number(producto.precioUnitario);
    const descuento = dto.descuento || 0;
    const precioTotal = calculateDiscountedTotal(
      precioUnitario,
      dto.cantidad,
      descuento,
      false,
    );

    try {
      const result = await this.repo.transaction(async (tx) => {
        const fp = await tx.createFacturaProducto({
          facturaId,
          productoId: dto.productoId,
          cantidad: dto.cantidad,
          descuento,
          precioTotal,
        });

        const updatedFactura = await tx.updateFacturaTotalAndGetDetails(
          facturaId,
          precioTotal,
        );

        return { fp, updatedFactura };
      });

      return {
        status: 201,
        message: 'Producto agregado a factura exitosamente',
        data: result,
      };
    } catch (error: unknown) {
      if (error instanceof DomainConflictError) {
        throw error;
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
    tx: FacturaRepositoryTx,
    userId: number,
    input: CreateFacturaInput,
    codePrefix: 'FAC' | 'OCR',
  ) {
    try {
      assertValidFacturaItems(input.items);
    } catch (error: unknown) {
      if (error instanceof FacturaDomainValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const productIds = [...new Set(input.items.map((item) => item.productoId))];

    const products = await tx.findProductosByIds(productIds);

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((product) => product.id));
      const missingIds = productIds.filter((id) => !foundIds.has(id));

      throw new FacturaNotFoundError(
        `Productos no encontrados: ${missingIds.join(', ')}`,
      );
    }

    const productById = new Map(
      products.map((product) => [product.id, product]),
    );

    const detalles = input.items.map((item) => {
      const product = productById.get(item.productoId)!;
      const precioUnitario = Number(product.precioUnitario);
      const descuento = item.descuento ?? 0;
      const precioTotal = calculateDiscountedTotal(
        precioUnitario,
        item.cantidad,
        descuento,
      );

      return {
        ...item,
        descuento,
        precioTotal,
      };
    });

    const totalPagar = calculateFacturaTotal(
      detalles.map((item) => item.precioTotal),
    );

    const factura = await tx.createFactura({
      usuarioId: userId,
      codigoFactura: this.generateFacturaCode(codePrefix),
      metodoPago: input.metodoPago,
      lugarCompra: input.lugarCompra,
      nitProveedor: input.nitProveedor,
      fechaHoraCompra: input.fechaHoraCompra ?? new Date(),
      totalPagar,
    });

    await Promise.all(
      detalles.map((item) =>
        tx.createFacturaProducto({
          facturaId: factura.id,
          productoId: item.productoId,
          cantidad: item.cantidad,
          unidad: item.unidad,
          descuento: item.descuento,
          precioTotal: item.precioTotal,
        }),
      ),
    );

    return tx.findFacturaByIdWithRelations(factura.id);
  }

  private async buildCreateInputFromOcrTx(
    tx: FacturaRepositoryTx,
    dto: ConfirmFacturaDto,
  ): Promise<CreateFacturaInput> {
    const items: CreateFacturaItemInput[] = [];

    for (const item of dto.productos) {
      let normalized: ReturnType<typeof normalizeAndValidateOcrItem>;
      try {
        normalized = normalizeAndValidateOcrItem(item);
      } catch (error: unknown) {
        if (error instanceof FacturaDomainValidationError) {
          throw new BadRequestException(error.message);
        }
        throw error;
      }

      let producto = await tx.findProductoByNombre(normalized.nombreDetectado);

      if (!producto) {
        if (
          !Number.isFinite(normalized.precioUnitario) ||
          normalized.precioUnitario <= 0
        ) {
          throw new BadRequestException(
            'Items OCR sin producto existente requieren precioUnitario valido',
          );
        }

        producto = await tx.createProducto({
          nombre: normalized.nombreDetectado,
          codigo: this.generateProductoCode(),
          precioUnitario: normalized.precioUnitario,
        });
      }

      items.push({
        productoId: producto.id,
        cantidad: normalized.cantidad,
        descuento: normalized.descuento,
        unidad: normalized.unidad,
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

  private async calculateStats(
    userId: number,
    startDate: Date,
    endDate: Date,
    prevStartDate: Date,
    prevEndDate: Date,
  ): Promise<FacturaStats> {
    const [
      currentPeriodCount,
      totalSpending,
      totalInvoices,
      prevTotalSpending,
    ] = await Promise.all([
      this.repo.countFacturasByUserAndRange(userId, { startDate, endDate }),
      this.repo.sumTotalPagarByUserAndRange(userId, { startDate, endDate }),
      this.repo.countFacturasByUser(userId),
      this.repo.sumTotalPagarByUserAndRange(userId, {
        startDate: prevStartDate,
        endDate: prevEndDate,
      }),
    ]);

    return {
      currentPeriodInvoices: currentPeriodCount,
      totalSpending,
      spendingTrend: calculateSpendingTrend(totalSpending, prevTotalSpending),
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
