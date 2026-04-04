import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { AddProductoFacturaDto } from './dto/add-producto.dto';
import { ConfirmFacturaDto } from './dto/confirm-factura.dto';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { CreateOcrFacturaDto } from './dto/create-ocr-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { Logger } from 'nestjs-pino';
import { AppError } from '../common/errors/app.error';
import { CustomPeriodRange, PeriodFilter } from './factura.types';
import { RequestContext } from '../common/context/request-context';
import {
  assertValidFacturaItems,
  assertValidCurrencyCode,
  calculateDiscountedTotal,
  calculateFacturaTotal,
  calculateBaseTotal,
  calculateSpendingTrend,
  FacturaDomainValidationError,
  getPeriodWindow,
  normalizeFacturaDate,
  normalizeFacturaUnidad,
  normalizeCurrencyCode,
  normalizeAndValidateOcrItem,
  mergeOcrDuplicates,
} from './factura.domain';
import { FACTURA_ERROR_CODES } from './errors/factura-error-codes';
import { FacturaNotFoundError } from './errors/factura-not-found.error';
import { DomainConflictError } from '../common/errors/domain-conflict.error';
import {
  FACTURA_REPOSITORY,
  FacturaRepositoryTx,
} from './factura.repository.port';
import type { FacturaRepository } from './factura.repository.port';
import type { MetodoPagoValue } from './factura.repository.port';
import type { UpdateFacturaRecordInput } from './factura.repository.port';
import { ExchangeRateService } from '../infra/exchange-rate/exchange-rate.service';
import { StorageService } from '../infra/storage/storage.service';

type FacturaStats = {
  currentPeriodInvoices: number;
  totalSpending: number;
  spendingTrend: number;
  totalInvoices: number;
};

type CurrencyInfo = {
  moneda: string;
  monedaBase: string;
  tasaCambio: number;
  tasaCambioFuente: string | null;
  tasaCambioFecha: Date | null;
};

function buildStatsCacheKey(
  userId: number,
  period: PeriodFilter,
  range?: CustomPeriodRange,
): string {
  if (period !== 'custom') {
    return `factura:stats:${userId}:${period}`;
  }

  const startDate = range?.startDate?.trim() || 'missing-start';
  const endDate = range?.endDate?.trim() || 'missing-end';

  return `factura:stats:${userId}:${period}:${startDate}:${endDate}`;
}

type CreateFacturaItemInput = {
  productoId: number;
  cantidad: number;
  descuento?: number;
  unidad?: string;
  precioUnitario?: number;
};

type CreateFacturaInput = {
  metodoPago: MetodoPagoValue;
  lugarCompra: string;
  nitProveedor?: string;
  fechaHoraCompra?: Date;
  items: CreateFacturaItemInput[];
  moneda?: string;
  tasaCambio?: number;
  imagenUrl?: string;
  ocrSource?: string;
};

@Injectable()
export class FacturaService {
  constructor(
    @Inject(FACTURA_REPOSITORY) private readonly repo: FacturaRepository,
    private logger: Logger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly exchangeRateService: ExchangeRateService,
    private readonly storage: StorageService,
  ) {}

  async create(
    userId: number,
    dto: CreateFacturaDto,
    file?: Express.Multer.File,
  ) {
    try {
      let imagenUrl: string | undefined;

      if (file) {
        try {
          const fileName = `factura-${Date.now()}-${userId}.jpg`;
          imagenUrl = await this.storage.upload(
            file.buffer,
            fileName,
            'invoices',
          );
        } catch (error: unknown) {
          this.logger.error({
            msg: 'Error al guardar imagen de factura',
            requestId: RequestContext.getRequestId(),
            error,
          });
        }
      }

      const currencyInfo = await this.resolveCurrencyInfo(
        userId,
        dto.moneda,
        dto.tasaCambio,
      );

      const factura = await this.repo.transaction((tx) =>
        this.createFacturaWithItemsTx(
          tx,
          userId,
          {
            metodoPago: dto.metodoPago,
            lugarCompra: dto.lugarCompra || 'Comercio Desconocido',
            nitProveedor: dto.nitProveedor,
            fechaHoraCompra: dto.fechaHoraCompra
              ? normalizeFacturaDate(dto.fechaHoraCompra)
              : undefined,
            items: dto.items,
            moneda: dto.moneda,
            tasaCambio: dto.tasaCambio,
            imagenUrl,
            ocrSource: dto.ocrSource,
          },
          'FAC',
          currencyInfo,
        ),
      );

      return {
        status: 201,
        message: 'Factura creada exitosamente',
        factura,
      };
    } catch (error: unknown) {
      if (error instanceof AppError) {
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
      const currencyInfo = await this.resolveCurrencyInfo(
        userId,
        dto.factura.moneda,
        dto.factura.tasaCambio,
      );

      const factura = await this.repo.transaction(async (tx) => {
        const input = await this.buildCreateInputFromOcrTx(tx, userId, dto);
        return this.createFacturaWithItemsTx(
          tx,
          userId,
          input,
          'OCR',
          currencyInfo,
        );
      });

      return {
        status: 201,
        message: 'Factura OCR confirmada exitosamente',
        data: { factura },
      };
    } catch (error: unknown) {
      if (error instanceof AppError) {
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

  async createWithOcrAndFile(
    userId: number,
    dto: CreateOcrFacturaDto,
    file?: Express.Multer.File,
  ) {
    try {
      let imagenUrl: string | undefined;

      if (file) {
        try {
          const fileName = `factura-ocr-${Date.now()}-${userId}.jpg`;
          imagenUrl = await this.storage.upload(
            file.buffer,
            fileName,
            'invoices',
          );
        } catch (error: unknown) {
          this.logger.error({
            msg: 'Error al guardar imagen de factura OCR',
            requestId: RequestContext.getRequestId(),
            error,
          });
        }
      }

      const currencyInfo = await this.resolveCurrencyInfo(
        userId,
        dto.moneda,
        dto.tasaCambio,
      );

      // 1. Normalize duplicates from OCR/AI before validation
      const normalizedOcrItems = mergeOcrDuplicates(dto.items);

      // 2. Strict business validation of items using domain codes
      const validatedItems = normalizedOcrItems.map((item, index) => {
        if (!item.nombreDetectado || typeof item.nombreDetectado !== 'string') {
          throw new FacturaDomainValidationError(
            FACTURA_ERROR_CODES.OCR_ITEM_NAME_MISSING,
            [
              {
                field: `items[${index}]`,
                code: FACTURA_ERROR_CODES.OCR_ITEM_NAME_MISSING,
                meta: { index },
              },
            ],
          );
        }

        const precio = Number(item.precioUnitario);
        if (isNaN(precio) || precio < 0) {
          throw new FacturaDomainValidationError(
            FACTURA_ERROR_CODES.OCR_ITEM_PRECIO_INVALID,
            [
              {
                field: `items[${index}].precioUnitario`,
                code: FACTURA_ERROR_CODES.OCR_ITEM_PRECIO_INVALID,
                meta: { index, productName: item.nombreDetectado },
              },
            ],
          );
        }

        const cantidad = Number(item.cantidadDetectada);
        if (isNaN(cantidad) || cantidad <= 0) {
          throw new FacturaDomainValidationError(
            FACTURA_ERROR_CODES.OCR_ITEM_CANTIDAD_INVALID,
            [
              {
                field: `items[${index}].cantidadDetectada`,
                code: FACTURA_ERROR_CODES.OCR_ITEM_CANTIDAD_INVALID,
                meta: { index, productName: item.nombreDetectado },
              },
            ],
          );
        }

        return {
          nombreDetectado: item.nombreDetectado,
          precioUnitario: precio,
          cantidadDetectada: cantidad,
          unidadDetectada: item.unidadDetectada || 'u',
          descuentoDetectado: Number(item.descuentoDetectado || 0),
        };
      });

      const confirmDto: ConfirmFacturaDto = {
        factura: {
          fechaHoraCompra: dto.fechaHoraCompra,
          metodoPago: dto.metodoPago || 'EFECTIVO',
          lugarCompra: dto.lugarCompra,
          nitProveedor: dto.nitProveedor,
          moneda: dto.moneda,
          tasaCambio: dto.tasaCambio,
          totalPagar: dto.totalPagar,
        },
        productos: validatedItems,
      };

      const factura = await this.repo.transaction(async (tx) => {
        const input = await this.buildCreateInputFromOcrTx(
          tx,
          userId,
          confirmDto,
        );
        input.imagenUrl = imagenUrl;
        input.ocrSource = dto.ocrSource;

        return this.createFacturaWithItemsTx(
          tx,
          userId,
          input,
          'OCR',
          currencyInfo,
        );
      });

      return {
        status: 201,
        message: 'Factura OCR registrada exitosamente con imagen',
        factura,
      };
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      this.logger.error({
        msg: 'Error al registrar factura OCR con imagen',
        requestId: RequestContext.getRequestId(),
        error,
      });
      throw new InternalServerErrorException(
        'Error al procesar el registro de factura OCR',
      );
    }
  }

  async findAll(
    userId: number,
    period: PeriodFilter = 'month',
    page = 1,
    limit = 20,
    range?: CustomPeriodRange,
  ) {
    try {
      const { startDate, endDate, prevStartDate, prevEndDate } =
        getPeriodWindow(period, new Date(), range);

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
      if (error instanceof AppError) {
        throw error;
      }

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

  async update(userId: number, facturaId: number, dto: UpdateFacturaDto) {
    const factura = await this.repo.findFacturaCurrencyByUser(
      userId,
      facturaId,
    );

    if (!factura) {
      throw new FacturaNotFoundError();
    }

    const itemsToUpdate = dto.items ?? [];

    if (itemsToUpdate.length > 0) {
      const seen = new Set<number>();
      for (let idx = 0; idx < itemsToUpdate.length; idx++) {
        const item = itemsToUpdate[idx];
        if (seen.has(item.productoId)) {
          throw new FacturaDomainValidationError(
            FACTURA_ERROR_CODES.ITEM_DUPLICATE,
            [
              {
                field: `items[${idx}]`,
                code: FACTURA_ERROR_CODES.ITEM_DUPLICATE,
                meta: { index: idx, productoId: item.productoId },
              },
            ],
          );
        }
        seen.add(item.productoId);
      }
    }

    try {
      const updatedFactura = await this.repo.transaction(async (tx) => {
        const updateData: UpdateFacturaRecordInput = {};

        if (dto.metodoPago !== undefined) {
          updateData.metodoPago = dto.metodoPago;
        }
        if (dto.lugarCompra !== undefined) {
          updateData.lugarCompra = dto.lugarCompra;
        }
        if (dto.nitProveedor !== undefined) {
          updateData.nitProveedor = dto.nitProveedor || null;
        }
        if (dto.fechaHoraCompra !== undefined) {
          updateData.fechaHoraCompra = normalizeFacturaDate(
            dto.fechaHoraCompra,
          );
        }

        const existingItems =
          await tx.findFacturaProductosByFacturaId(facturaId);

        const updatedPrecioTotals = new Map<number, number>();

        if (itemsToUpdate.length > 0) {
          const existingByProductoId = new Map(
            existingItems.map((item) => [item.productoId, item]),
          );

          for (const item of itemsToUpdate) {
            const current = existingByProductoId.get(item.productoId);
            if (!current) {
              throw new FacturaNotFoundError([
                {
                  field: `items[${itemsToUpdate.indexOf(item)}]`,
                  code: FACTURA_ERROR_CODES.PRODUCTO_NOT_FOUND,
                  meta: { productoId: item.productoId },
                },
              ]);
            }

            const cantidad =
              item.cantidad !== undefined
                ? item.cantidad
                : Number(current.cantidad);
            const unidad = normalizeFacturaUnidad(
              item.unidad ?? current.unidad,
            );
            const descuento =
              item.descuento !== undefined
                ? item.descuento
                : current.descuento
                  ? Number(current.descuento)
                  : 0;
            const precioUnitario =
              item.precioUnitario !== undefined
                ? item.precioUnitario
                : Number(current.precioUnitario);

            const precioUnitarioFinal = Number.isFinite(precioUnitario)
              ? precioUnitario
              : Number(current.precioTotal) / Math.max(cantidad, 1);

            if (!Number.isFinite(precioUnitarioFinal)) {
              throw new FacturaDomainValidationError(
                FACTURA_ERROR_CODES.ITEM_PRECIO_INVALID,
                [
                  {
                    field: `items[${itemsToUpdate.indexOf(item)}].precioUnitario`,
                    code: FACTURA_ERROR_CODES.ITEM_PRECIO_INVALID,
                    meta: { productoId: item.productoId },
                  },
                ],
              );
            }

            assertValidFacturaItems([
              {
                productoId: item.productoId,
                cantidad,
                unidad,
                descuento,
                precioUnitario: precioUnitarioFinal,
              },
            ]);

            const nuevoPrecioTotal = calculateDiscountedTotal(
              precioUnitarioFinal,
              cantidad,
              descuento,
            );

            updatedPrecioTotals.set(item.productoId, nuevoPrecioTotal);

            await tx.updateFacturaProductoSnapshot({
              facturaId,
              productoId: item.productoId,
              cantidad,
              unidad,
              descuento,
              precioUnitario: precioUnitarioFinal,
              precioTotal: nuevoPrecioTotal,
            });
          }

          const totalPagar = calculateFacturaTotal(
            existingItems.map((item) => {
              const updated = updatedPrecioTotals.get(item.productoId);
              return updated ?? Number(item.precioTotal ?? 0);
            }),
          );

          updateData.totalPagar = totalPagar;
          const monedaBase = normalizeCurrencyCode(factura.monedaBase ?? 'COP');
          const moneda = normalizeCurrencyCode(factura.moneda ?? monedaBase);
          const tasaCambioRaw = Number(factura.tasaCambio);
          const tasaCambio =
            Number.isFinite(tasaCambioRaw) && tasaCambioRaw > 0
              ? tasaCambioRaw
              : moneda === monedaBase
                ? 1
                : Number.NaN;

          if (!Number.isFinite(tasaCambio) || tasaCambio <= 0) {
            throw new FacturaDomainValidationError(
              FACTURA_ERROR_CODES.TASA_CAMBIO_INVALID,
              [{ code: FACTURA_ERROR_CODES.TASA_CAMBIO_INVALID }],
            );
          }

          updateData.moneda = factura.moneda ?? moneda;
          updateData.monedaBase = factura.monedaBase ?? monedaBase;
          updateData.tasaCambio = factura.tasaCambio
            ? Number(factura.tasaCambio)
            : tasaCambio;
          updateData.totalPagarBase = calculateBaseTotal(
            totalPagar,
            tasaCambio,
          );
        }

        if (Object.keys(updateData).length > 0) {
          await tx.updateFactura(facturaId, updateData);
        }

        return tx.findFacturaByIdWithRelations(facturaId);
      });

      return {
        status: 200,
        message: 'Factura actualizada exitosamente',
        factura: updatedFactura,
      };
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      this.logger.error({
        msg: 'Error al actualizar factura',
        requestId: RequestContext.getRequestId(),
        error,
      });
      throw new InternalServerErrorException('Error al actualizar factura');
    }
  }

  async remove(userId: number, facturaId: number) {
    const factura = await this.repo.findFacturaIdByUser(userId, facturaId);

    if (!factura) {
      throw new FacturaNotFoundError();
    }

    try {
      await this.repo.transaction(async (tx) => {
        await tx.deleteFacturaProductosByFacturaId(facturaId);
        await tx.deleteFacturaById(facturaId);
      });

      return {
        status: 200,
        message: 'Factura eliminada exitosamente',
      };
    } catch (error: unknown) {
      this.logger.error({
        msg: 'Error al eliminar factura',
        requestId: RequestContext.getRequestId(),
        error,
      });
      throw new InternalServerErrorException('Error al eliminar factura');
    }
  }

  async getStats(
    userId: number,
    period: PeriodFilter = 'month',
    range?: CustomPeriodRange,
  ) {
    const cacheKey = buildStatsCacheKey(userId, period, range);
    const cached = await this.cacheManager.get<FacturaStats>(cacheKey);
    if (cached) {
      return {
        status: 200,
        message: 'Estadisticas obtenidas exitosamente (cache)',
        stats: cached,
      };
    }

    const { startDate, endDate, prevStartDate, prevEndDate } = getPeriodWindow(
      period,
      new Date(),
      range,
    );

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
    const factura = await this.repo.findFacturaCurrencyByUser(
      userId,
      facturaId,
    );

    if (!factura) {
      throw new FacturaNotFoundError();
    }

    const producto = await this.repo.findProductoById(userId, dto.productoId);

    if (!producto) {
      throw new FacturaNotFoundError([
        { code: FACTURA_ERROR_CODES.PRODUCTO_NOT_FOUND },
      ]);
    }

    const precioUnitario =
      dto.precioUnitario ?? Number(producto.precioUnitario);
    const unidad = normalizeFacturaUnidad(dto.unidad);
    const descuento = dto.descuento || 0;

    assertValidFacturaItems([
      {
        productoId: dto.productoId,
        cantidad: dto.cantidad,
        unidad,
        descuento,
        precioUnitario,
      },
    ]);

    const precioTotal = calculateDiscountedTotal(
      precioUnitario,
      dto.cantidad,
      descuento,
      false,
    );

    const monedaBase = normalizeCurrencyCode(factura.monedaBase ?? 'COP');
    const moneda = normalizeCurrencyCode(factura.moneda ?? monedaBase);
    const tasaCambioRaw = Number(factura.tasaCambio);
    const tasaCambio =
      Number.isFinite(tasaCambioRaw) && tasaCambioRaw > 0
        ? tasaCambioRaw
        : moneda === monedaBase
          ? 1
          : Number.NaN;

    if (!Number.isFinite(tasaCambio) || tasaCambio <= 0) {
      throw new FacturaDomainValidationError(
        FACTURA_ERROR_CODES.TASA_CAMBIO_INVALID,
        [{ code: FACTURA_ERROR_CODES.TASA_CAMBIO_INVALID }],
      );
    }

    const precioTotalBase = calculateBaseTotal(precioTotal, tasaCambio);
    const existingTotalBase = Number(factura.totalPagarBase);
    const existingTotalRaw = Number(factura.totalPagar);
    const existingTotal = Number.isFinite(existingTotalRaw)
      ? existingTotalRaw
      : 0;
    const shouldBackfillBase =
      !Number.isFinite(existingTotalBase) || existingTotalBase <= 0;

    try {
      const result = await this.repo.transaction(async (tx) => {
        const backfillData: UpdateFacturaRecordInput = {};
        if (!factura.moneda) {
          backfillData.moneda = moneda;
        }
        if (!factura.monedaBase) {
          backfillData.monedaBase = monedaBase;
        }
        if (!factura.tasaCambio) {
          backfillData.tasaCambio = tasaCambio;
        }
        if (shouldBackfillBase) {
          backfillData.totalPagarBase = calculateBaseTotal(
            existingTotal,
            tasaCambio,
          );
        }

        if (Object.keys(backfillData).length > 0) {
          await tx.updateFactura(facturaId, backfillData);
        }

        const fp = await tx.createFacturaProducto({
          facturaId,
          productoId: dto.productoId,
          cantidad: dto.cantidad,
          unidad,
          descuento,
          precioUnitario,
          precioTotal,
          productoNombre: producto.nombre,
          productoCodigo: producto.codigo,
        });

        const updatedFactura = await tx.updateFacturaTotalAndGetDetails(
          facturaId,
          precioTotal,
          precioTotalBase,
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
    currencyInfo: CurrencyInfo,
  ) {
    assertValidFacturaItems(input.items);

    const productIds = [...new Set(input.items.map((item) => item.productoId))];

    const products = await tx.findProductosByIds(userId, productIds);

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((product) => product.id));
      const missingIds = productIds.filter((id) => !foundIds.has(id));

      throw new FacturaNotFoundError([
        {
          code: FACTURA_ERROR_CODES.ITEMS_NOT_FOUND,
          meta: { missingIds },
        },
      ]);
    }

    const productById = new Map(
      products.map((product) => [product.id, product]),
    );

    const detalles = input.items.map((item) => {
      const product = productById.get(item.productoId)!;
      const precioUnitario =
        item.precioUnitario ?? Number(product.precioUnitario);
      const descuento = item.descuento ?? 0;
      const precioTotal = calculateDiscountedTotal(
        precioUnitario,
        item.cantidad,
        descuento,
      );

      return {
        ...item,
        descuento,
        precioUnitario,
        precioTotal,
        productoNombre: product.nombre,
        productoCodigo: product.codigo,
      };
    });

    const totalPagar = calculateFacturaTotal(
      detalles.map((item) => item.precioTotal),
    );
    const totalPagarBase = calculateBaseTotal(
      totalPagar,
      currencyInfo.tasaCambio,
    );

    const factura = await tx.createFactura({
      usuarioId: userId,
      codigoFactura: this.generateFacturaCode(codePrefix),
      metodoPago: input.metodoPago,
      lugarCompra: input.lugarCompra,
      nitProveedor: input.nitProveedor,
      fechaHoraCompra:
        input.fechaHoraCompra ?? normalizeFacturaDate(new Date()),
      totalPagar,
      moneda: currencyInfo.moneda,
      monedaBase: currencyInfo.monedaBase,
      tasaCambio: currencyInfo.tasaCambio,
      tasaCambioFecha: currencyInfo.tasaCambioFecha,
      tasaCambioFuente: currencyInfo.tasaCambioFuente,
      totalPagarBase,
      imagenUrl: input.imagenUrl,
      ocrSource: input.ocrSource,
    });

    await Promise.all(
      detalles.map((item) =>
        tx.createFacturaProducto({
          facturaId: factura.id,
          productoId: item.productoId,
          cantidad: item.cantidad,
          unidad: item.unidad,
          descuento: item.descuento,
          precioUnitario: item.precioUnitario,
          precioTotal: item.precioTotal,
          productoNombre: item.productoNombre,
          productoCodigo: item.productoCodigo,
        }),
      ),
    );

    return tx.findFacturaByIdWithRelations(factura.id);
  }

  private async buildCreateInputFromOcrTx(
    tx: FacturaRepositoryTx,
    userId: number,
    dto: ConfirmFacturaDto,
  ): Promise<CreateFacturaInput> {
    const items: CreateFacturaItemInput[] = [];

    for (let index = 0; index < dto.productos.length; index++) {
      const item = dto.productos[index];
      // FacturaDomainValidationError (AppError) is caught by GlobalExceptionFilter directly
      const normalized = normalizeAndValidateOcrItem(item, index);

      let producto = await tx.findProductoByNombre(
        userId,
        normalized.nombreDetectado,
      );

      if (!producto) {
        if (
          !Number.isFinite(normalized.precioUnitario) ||
          normalized.precioUnitario <= 0
        ) {
          throw new FacturaDomainValidationError(
            FACTURA_ERROR_CODES.OCR_ITEM_PRECIO_INVALID,
            [
              {
                field: `items[${index}].precioUnitario`,
                code: FACTURA_ERROR_CODES.OCR_ITEM_PRECIO_INVALID,
                meta: { index, productName: normalized.nombreDetectado },
              },
            ],
          );
        }

        producto = await tx.createProducto(userId, {
          nombre: normalized.nombreDetectado,
          codigo: this.generateProductoCode(),
          precioUnitario: normalized.precioUnitario,
        });
      }

      const precioUnitario = Number.isFinite(normalized.precioUnitario)
        ? normalized.precioUnitario
        : undefined;

      items.push({
        productoId: producto.id,
        cantidad: normalized.cantidad,
        descuento: normalized.descuento,
        unidad: normalized.unidad,
        precioUnitario,
      });
    }

    return {
      metodoPago: dto.factura.metodoPago,
      lugarCompra: dto.factura.lugarCompra,
      nitProveedor: dto.factura.nitProveedor,
      fechaHoraCompra: normalizeFacturaDate(dto.factura.fechaHoraCompra),
      items,
      moneda: dto.factura.moneda,
      tasaCambio: dto.factura.tasaCambio,
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

  private async resolveCurrencyInfo(
    userId: number,
    monedaInput?: string,
    tasaCambioInput?: number,
  ): Promise<CurrencyInfo> {
    const userMonedaBase = await this.repo.findUsuarioMonedaBase(userId);
    const monedaBase = normalizeCurrencyCode(userMonedaBase ?? 'COP');
    const moneda = normalizeCurrencyCode(monedaInput ?? monedaBase);

    // FacturaDomainValidationError (AppError) propagates to GlobalExceptionFilter
    assertValidCurrencyCode(monedaBase);
    assertValidCurrencyCode(moneda);

    if (moneda === monedaBase) {
      if (tasaCambioInput && Math.abs(tasaCambioInput - 1) > 0.000001) {
        throw new FacturaDomainValidationError(
          FACTURA_ERROR_CODES.TASA_CAMBIO_INVALID,
          [{ code: FACTURA_ERROR_CODES.TASA_CAMBIO_INVALID }],
        );
      }

      return {
        moneda,
        monedaBase,
        tasaCambio: 1,
        tasaCambioFuente: null,
        tasaCambioFecha: null,
      };
    }

    if (tasaCambioInput !== undefined) {
      if (!Number.isFinite(tasaCambioInput) || tasaCambioInput <= 0) {
        throw new FacturaDomainValidationError(
          FACTURA_ERROR_CODES.TASA_CAMBIO_INVALID,
          [{ code: FACTURA_ERROR_CODES.TASA_CAMBIO_INVALID }],
        );
      }

      return {
        moneda,
        monedaBase,
        tasaCambio: tasaCambioInput,
        tasaCambioFuente: 'MANUAL',
        tasaCambioFecha: new Date(),
      };
    }

    try {
      const rate = await this.exchangeRateService.getRate(moneda, monedaBase);
      return {
        moneda,
        monedaBase,
        tasaCambio: rate.rate,
        tasaCambioFuente: rate.source,
        tasaCambioFecha: rate.fetchedAt,
      };
    } catch (error: unknown) {
      this.logger.error({
        msg: 'No se pudo obtener tasa de cambio',
        requestId: RequestContext.getRequestId(),
        error,
      });

      throw new FacturaDomainValidationError(
        FACTURA_ERROR_CODES.TASA_CAMBIO_INVALID,
        [{ code: FACTURA_ERROR_CODES.TASA_CAMBIO_INVALID }],
      );
    }
  }

  private generateFacturaCode(prefix: 'FAC' | 'OCR'): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  private generateProductoCode(): string {
    return `PROD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
}
