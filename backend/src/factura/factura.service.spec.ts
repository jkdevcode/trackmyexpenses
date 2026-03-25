import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';
import { DomainConflictError } from '../common/errors/domain-conflict.error';
import { FacturaNotFoundError } from './errors/factura-not-found.error';
import { FACTURA_REPOSITORY } from './factura.repository.port';
import { FacturaService } from './factura.service';
import { ExchangeRateService } from '../infra/exchange-rate/exchange-rate.service';
import { StorageService } from '../infra/storage/storage.service';

describe('FacturaService', () => {
  let service: FacturaService;
  let repo: {
    transaction: jest.Mock;
    findFacturaIdByUser: jest.Mock;
    findFacturaCurrencyByUser: jest.Mock;
    findProductoById: jest.Mock;
    findFacturasByUserAndRange: jest.Mock;
    countFacturasByUserAndRange: jest.Mock;
    countFacturasByUser: jest.Mock;
    sumTotalPagarByUserAndRange: jest.Mock;
    findFacturaDetailByUser: jest.Mock;
    findFacturaProductosByFacturaId: jest.Mock;
    findUsuarioMonedaBase: jest.Mock;
  };
  let logger: { error: jest.Mock };
  let cache: { get: jest.Mock; set: jest.Mock };
  let exchangeRateService: { getRate: jest.Mock };
  let storage: { upload: jest.Mock };

  beforeEach(async () => {
    repo = {
      transaction: jest.fn(),
      findFacturaIdByUser: jest.fn(),
      findFacturaCurrencyByUser: jest.fn(),
      findProductoById: jest.fn(),
      findFacturasByUserAndRange: jest.fn(),
      countFacturasByUserAndRange: jest.fn(),
      countFacturasByUser: jest.fn(),
      sumTotalPagarByUserAndRange: jest.fn(),
      findFacturaDetailByUser: jest.fn(),
      findFacturaProductosByFacturaId: jest.fn(),
      findUsuarioMonedaBase: jest.fn(),
    };
    repo.findUsuarioMonedaBase.mockResolvedValue('COP');
    logger = { error: jest.fn() };
    cache = { get: jest.fn(), set: jest.fn() };
    exchangeRateService = { getRate: jest.fn() };
    storage = { upload: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturaService,
        { provide: FACTURA_REPOSITORY, useValue: repo },
        { provide: Logger, useValue: logger },
        { provide: CACHE_MANAGER, useValue: cache },
        { provide: ExchangeRateService, useValue: exchangeRateService },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get<FacturaService>(FacturaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create factura successfully', async () => {
    const tx = {
      findProductosByIds: jest
        .fn()
        .mockResolvedValue([
          { id: 1, precioUnitario: 3000, nombre: 'ARROZ', codigo: 'P-1' },
        ]),
      createFactura: jest.fn().mockResolvedValue({ id: 10 }),
      createFacturaProducto: jest.fn().mockResolvedValue({ id: 20 }),
      findFacturaByIdWithRelations: jest
        .fn()
        .mockResolvedValue({ id: 10, codigoFactura: 'FAC-1' }),
    };
    repo.transaction.mockImplementation(async (callback: any) => callback(tx));

    const dto = {
      metodoPago: 'EFECTIVO',
      lugarCompra: 'TIENDA',
      items: [{ productoId: 1, cantidad: 2, descuento: 0 }],
    };

    const result = await service.create(5, dto as any);

    expect(repo.transaction).toHaveBeenCalled();
    expect(tx.findProductosByIds).toHaveBeenCalledWith(5, [1]);
    expect(tx.createFactura).toHaveBeenCalled();
    expect(tx.createFacturaProducto).toHaveBeenCalledWith(
      expect.objectContaining({
        productoId: 1,
        cantidad: 2,
      }),
    );
    expect(result).toEqual({
      status: 201,
      message: 'Factura creada exitosamente',
      factura: { id: 10, codigoFactura: 'FAC-1' },
    });
  });

  it('should throw FacturaNotFoundError when some products are missing in create', async () => {
    const tx = {
      findProductosByIds: jest.fn().mockResolvedValue([]),
      createFactura: jest.fn(),
      createFacturaProducto: jest.fn(),
      findFacturaByIdWithRelations: jest.fn(),
    };
    repo.transaction.mockImplementation(async (callback: any) => callback(tx));

    await expect(
      service.create(5, {
        metodoPago: 'EFECTIVO',
        lugarCompra: 'TIENDA',
        items: [{ productoId: 99, cantidad: 1 }],
      } as any),
    ).rejects.toBeInstanceOf(FacturaNotFoundError);
  });

  it('should confirm factura from OCR successfully (createFromOcr)', async () => {
    const tx = {
      findProductoByNombre: jest.fn().mockResolvedValue({ id: 7 }),
      createProducto: jest.fn(),
      findProductosByIds: jest
        .fn()
        .mockResolvedValue([
          { id: 7, precioUnitario: 5000, nombre: 'LECHE', codigo: 'P-7' },
        ]),
      createFactura: jest.fn().mockResolvedValue({ id: 11 }),
      createFacturaProducto: jest.fn().mockResolvedValue({ id: 21 }),
      findFacturaByIdWithRelations: jest.fn().mockResolvedValue({ id: 11 }),
    };
    repo.transaction.mockImplementation(async (callback: any) => callback(tx));

    const dto = {
      factura: {
        fechaHoraCompra: '2026-03-05T10:00:00.000Z',
        metodoPago: 'EFECTIVO',
        lugarCompra: 'SUPERMERCADO',
      },
      productos: [
        {
          nombreDetectado: 'LECHE ENTERA',
          precioUnitario: 5000,
          cantidadDetectada: 1,
          descuentoDetectado: 0,
        },
      ],
    };

    const result = await service.createFromOcr(9, dto as any);

    expect(tx.findProductoByNombre).toHaveBeenCalledWith(9, 'LECHE ENTERA');
    expect(tx.createProducto).not.toHaveBeenCalled();
    expect(result.status).toBe(201);
    expect(result.message).toBe('Factura OCR confirmada exitosamente');
  });

  it('should calculate total correctly in confirmFactura (createFromOcr)', async () => {
    const tx = {
      findProductoByNombre: jest.fn().mockResolvedValue({ id: 7 }),
      createProducto: jest.fn(),
      findProductosByIds: jest
        .fn()
        .mockResolvedValue([
          { id: 7, precioUnitario: 5000, nombre: 'LECHE', codigo: 'P-7' },
        ]),
      createFactura: jest.fn().mockResolvedValue({ id: 11 }),
      createFacturaProducto: jest.fn().mockResolvedValue({ id: 21 }),
      findFacturaByIdWithRelations: jest.fn().mockResolvedValue({ id: 11 }),
    };
    repo.transaction.mockImplementation(async (callback: any) => callback(tx));

    await service.createFromOcr(9, {
      factura: {
        fechaHoraCompra: '2026-03-05T10:00:00.000Z',
        metodoPago: 'EFECTIVO',
        lugarCompra: 'SUPERMERCADO',
      },
      productos: [
        {
          nombreDetectado: 'LECHE ENTERA',
          precioUnitario: 5000,
          cantidadDetectada: 2,
          descuentoDetectado: 10,
        },
      ],
    } as any);

    expect(tx.createFactura).toHaveBeenCalledWith(
      expect.objectContaining({
        usuarioId: 9,
        totalPagar: 9000,
      }),
    );
  });

  it('should throw BadRequestException in createFromOcr when product does not exist and price is invalid', async () => {
    const tx = {
      findProductoByNombre: jest.fn().mockResolvedValue(null),
      createProducto: jest.fn(),
      findProductosByIds: jest.fn(),
      createFactura: jest.fn(),
      createFacturaProducto: jest.fn(),
      findFacturaByIdWithRelations: jest.fn(),
    };
    repo.transaction.mockImplementation(async (callback: any) => callback(tx));

    await expect(
      service.createFromOcr(1, {
        factura: {
          fechaHoraCompra: '2026-03-05T10:00:00.000Z',
          metodoPago: 'EFECTIVO',
          lugarCompra: 'TIENDA',
        },
        productos: [
          {
            nombreDetectado: 'NUEVO',
            precioUnitario: 0,
            cantidadDetectada: 1,
          },
        ],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw FacturaNotFoundError in confirmFactura (createFromOcr) when confirmed product ids are missing', async () => {
    const tx = {
      findProductoByNombre: jest.fn().mockResolvedValue({ id: 77 }),
      createProducto: jest.fn(),
      findProductosByIds: jest.fn().mockResolvedValue([]),
      createFactura: jest.fn(),
      createFacturaProducto: jest.fn(),
      findFacturaByIdWithRelations: jest.fn(),
    };
    repo.transaction.mockImplementation(async (callback: any) => callback(tx));

    await expect(
      service.createFromOcr(1, {
        factura: {
          fechaHoraCompra: '2026-03-05T10:00:00.000Z',
          metodoPago: 'EFECTIVO',
          lugarCompra: 'TIENDA',
        },
        productos: [
          {
            nombreDetectado: 'NUEVO',
            precioUnitario: 1000,
            cantidadDetectada: 1,
          },
        ],
      } as any),
    ).rejects.toBeInstanceOf(FacturaNotFoundError);
  });

  it('should filter getFacturas by user (findAll)', async () => {
    repo.findFacturasByUserAndRange.mockResolvedValue([
      { id: 1, usuarioId: 12 },
    ]);
    repo.countFacturasByUserAndRange.mockResolvedValue(1);
    repo.countFacturasByUser.mockResolvedValue(5);
    repo.sumTotalPagarByUserAndRange
      .mockResolvedValueOnce(12000)
      .mockResolvedValueOnce(10000);

    const result = await service.findAll(12, 'month', 2, 5);

    expect(repo.findFacturasByUserAndRange).toHaveBeenCalledWith(
      12,
      expect.objectContaining({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      }),
      2,
      5,
    );
    expect(result.facturas).toEqual([{ id: 1, usuarioId: 12 }]);
    expect(result.pagination).toEqual({ page: 2, limit: 5, total: 1 });
  });

  it('should add producto to factura', async () => {
    repo.findFacturaCurrencyByUser.mockResolvedValue({
      id: 50,
      totalPagar: 0,
      totalPagarBase: 0,
      moneda: 'COP',
      monedaBase: 'COP',
      tasaCambio: 1,
    });
    repo.findProductoById.mockResolvedValue({
      id: 1,
      precioUnitario: 10000,
      nombre: 'AZUCAR',
      codigo: 'P-1',
    });
    const tx = {
      createFacturaProducto: jest.fn().mockResolvedValue({ id: 77 }),
      updateFacturaTotalAndGetDetails: jest
        .fn()
        .mockResolvedValue({ id: 50, totalPagar: 18000 }),
      updateFactura: jest.fn(),
    };
    repo.transaction.mockImplementation(async (callback: any) => callback(tx));

    const result = await service.addProducto(1, 50, {
      productoId: 1,
      cantidad: 2,
      descuento: 10,
    } as any);

    expect(repo.findFacturaCurrencyByUser).toHaveBeenCalledWith(1, 50);
    expect(repo.findProductoById).toHaveBeenCalledWith(1, 1);
    expect(repo.transaction).toHaveBeenCalled();
    expect(tx.createFacturaProducto).toHaveBeenCalledWith(
      expect.objectContaining({
        facturaId: 50,
        productoId: 1,
        precioTotal: 18000,
      }),
    );
    expect(tx.updateFacturaTotalAndGetDetails).toHaveBeenCalledWith(
      50,
      18000,
      18000,
    );
    expect(result).toEqual(
      expect.objectContaining({
        status: 201,
        message: 'Producto agregado a factura exitosamente',
      }),
    );
  });

  it('should throw FacturaNotFoundError when factura does not exist in addProducto', async () => {
    repo.findFacturaCurrencyByUser.mockResolvedValue(null);

    await expect(
      service.addProducto(1, 999, { productoId: 1, cantidad: 1 } as any),
    ).rejects.toBeInstanceOf(FacturaNotFoundError);
  });

  it('should throw DomainConflictError when repository reports duplicate product in factura', async () => {
    repo.findFacturaCurrencyByUser.mockResolvedValue({
      id: 50,
      totalPagar: 0,
      totalPagarBase: 0,
      moneda: 'COP',
      monedaBase: 'COP',
      tasaCambio: 1,
    });
    repo.findProductoById.mockResolvedValue({
      id: 1,
      precioUnitario: 10000,
      nombre: 'AZUCAR',
      codigo: 'P-1',
    });
    repo.transaction.mockRejectedValue(
      new DomainConflictError('El producto ya esta en la factura'),
    );

    await expect(
      service.addProducto(1, 50, { productoId: 1, cantidad: 1 } as any),
    ).rejects.toBeInstanceOf(DomainConflictError);
  });

  it('should throw FacturaNotFoundError when producto does not exist in addProducto', async () => {
    repo.findFacturaCurrencyByUser.mockResolvedValue({
      id: 50,
      totalPagar: 0,
      totalPagarBase: 0,
      moneda: 'COP',
      monedaBase: 'COP',
      tasaCambio: 1,
    });
    repo.findProductoById.mockResolvedValue(null);

    await expect(
      service.addProducto(1, 50, { productoId: 987, cantidad: 1 } as any),
    ).rejects.toBeInstanceOf(FacturaNotFoundError);
  });

  it('should update factura and item prices', async () => {
    repo.findFacturaCurrencyByUser.mockResolvedValue({
      id: 88,
      totalPagar: 3000,
      totalPagarBase: 3000,
      moneda: 'COP',
      monedaBase: 'COP',
      tasaCambio: 1,
    });
    const tx = {
      findFacturaProductosByFacturaId: jest.fn().mockResolvedValue([
        {
          id: 1,
          productoId: 10,
          cantidad: 2,
          descuento: 10,
          precioUnitario: 1500,
          precioTotal: 3000,
        },
      ]),
      updateFacturaProductoSnapshot: jest.fn(),
      updateFactura: jest.fn(),
      findFacturaByIdWithRelations: jest.fn().mockResolvedValue({
        id: 88,
        codigoFactura: 'FAC-88',
      }),
    };
    repo.transaction.mockImplementation(async (callback: any) => callback(tx));

    const result = await service.update(5, 88, {
      metodoPago: 'EFECTIVO',
      items: [{ productoId: 10, precioUnitario: 2000 }],
    } as any);

    expect(tx.findFacturaProductosByFacturaId).toHaveBeenCalledWith(88);
    expect(tx.updateFacturaProductoSnapshot).toHaveBeenCalledWith({
      facturaId: 88,
      productoId: 10,
      cantidad: 2,
      descuento: 10,
      precioUnitario: 2000,
      precioTotal: 3600,
    });
    expect(tx.updateFactura).toHaveBeenCalledWith(
      88,
      expect.objectContaining({
        metodoPago: 'EFECTIVO',
        totalPagar: 3600,
        totalPagarBase: 3600,
      }),
    );
    expect(result).toEqual({
      status: 200,
      message: 'Factura actualizada exitosamente',
      factura: { id: 88, codigoFactura: 'FAC-88' },
    });
  });

  it('should delete factura without removing products', async () => {
    repo.findFacturaIdByUser.mockResolvedValue({ id: 99 });
    const tx = {
      deleteFacturaProductosByFacturaId: jest.fn(),
      deleteFacturaById: jest.fn(),
    };
    repo.transaction.mockImplementation(async (callback: any) => callback(tx));

    const result = await service.remove(7, 99);

    expect(tx.deleteFacturaProductosByFacturaId).toHaveBeenCalledWith(99);
    expect(tx.deleteFacturaById).toHaveBeenCalledWith(99);
    expect(result).toEqual({
      status: 200,
      message: 'Factura eliminada exitosamente',
    });
  });

  it('should return cached stats on getStats', async () => {
    cache.get.mockResolvedValue({
      currentPeriodInvoices: 3,
      totalSpending: 40000,
      spendingTrend: 15,
      totalInvoices: 8,
    });

    const result = await service.getStats(5, 'month');

    expect(cache.get).toHaveBeenCalledWith('factura:stats:5:month');
    expect(result.message).toContain('(cache)');
    expect(repo.countFacturasByUserAndRange).not.toHaveBeenCalled();
  });

  it('should compute and cache stats on getStats cache miss', async () => {
    cache.get.mockResolvedValue(null);
    repo.countFacturasByUserAndRange.mockResolvedValue(2);
    repo.sumTotalPagarByUserAndRange
      .mockResolvedValueOnce(20000)
      .mockResolvedValueOnce(10000);
    repo.countFacturasByUser.mockResolvedValue(6);

    const result = await service.getStats(3, 'week');

    expect(result.message).toBe('Estadisticas obtenidas exitosamente');
    expect(result.stats).toEqual({
      currentPeriodInvoices: 2,
      totalSpending: 20000,
      spendingTrend: 100,
      totalInvoices: 6,
    });
    expect(cache.set).toHaveBeenCalledWith(
      'factura:stats:3:week',
      result.stats,
      600000,
    );
  });

  it('should throw InternalServerErrorException when findAll fails unexpectedly', async () => {
    repo.findFacturasByUserAndRange.mockRejectedValue(new Error('db failure'));

    await expect(service.findAll(3, 'month', 1, 20)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    expect(logger.error).toHaveBeenCalled();
  });

  it('should create missing OCR product when it is not found by name', async () => {
    const tx = {
      findProductoByNombre: jest.fn().mockResolvedValue(null),
      createProducto: jest.fn().mockResolvedValue({ id: 15 }),
      findProductosByIds: jest
        .fn()
        .mockResolvedValue([
          { id: 15, precioUnitario: 2500, nombre: 'PROD', codigo: 'P-15' },
        ]),
      createFactura: jest.fn().mockResolvedValue({ id: 22 }),
      createFacturaProducto: jest.fn().mockResolvedValue({ id: 30 }),
      findFacturaByIdWithRelations: jest.fn().mockResolvedValue({ id: 22 }),
    };
    repo.transaction.mockImplementation(async (callback: any) => callback(tx));

    await service.createFromOcr(9, {
      factura: {
        fechaHoraCompra: '2026-03-06T10:00:00.000Z',
        metodoPago: 'EFECTIVO',
        lugarCompra: 'SUPERMERCADO',
      },
      productos: [
        {
          nombreDetectado: 'PRODUCTO NUEVO',
          precioUnitario: 2500,
          cantidadDetectada: 2,
          descuentoDetectado: 0,
        },
      ],
    } as any);

    expect(tx.createProducto).toHaveBeenCalledWith(
      9,
      expect.objectContaining({
        nombre: 'PRODUCTO NUEVO',
        codigo: expect.stringContaining('PROD-'),
        precioUnitario: 2500,
      }),
    );
  });

  it('should throw BadRequestException on invalid OCR item shape', async () => {
    const tx = {
      findProductoByNombre: jest.fn(),
      createProducto: jest.fn(),
      findProductosByIds: jest.fn(),
      createFactura: jest.fn(),
      createFacturaProducto: jest.fn(),
      findFacturaByIdWithRelations: jest.fn(),
    };
    repo.transaction.mockImplementation(async (callback: any) => callback(tx));

    await expect(
      service.createFromOcr(1, {
        factura: {
          fechaHoraCompra: '2026-03-06T10:00:00.000Z',
          metodoPago: 'EFECTIVO',
          lugarCompra: 'TIENDA',
        },
        productos: [
          {
            nombreDetectado: '',
            precioUnitario: 1000,
            cantidadDetectada: 1,
          },
        ],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw InternalServerErrorException on unexpected createFromOcr error', async () => {
    repo.transaction.mockRejectedValue(new Error('ocr db down'));

    await expect(
      service.createFromOcr(1, {
        factura: {
          fechaHoraCompra: '2026-03-06T10:00:00.000Z',
          metodoPago: 'EFECTIVO',
          lugarCompra: 'TIENDA',
        },
        productos: [
          {
            nombreDetectado: 'PAN',
            precioUnitario: 1000,
            cantidadDetectada: 1,
          },
        ],
      } as any),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should throw InternalServerErrorException on unexpected create error', async () => {
    repo.transaction.mockRejectedValue(new Error('db down'));

    await expect(
      service.create(1, {
        metodoPago: 'EFECTIVO',
        lugarCompra: 'TIENDA',
        items: [{ productoId: 1, cantidad: 1 }],
      } as any),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should continue creating factura when image upload fails', async () => {
    const tx = {
      findProductosByIds: jest
        .fn()
        .mockResolvedValue([
          { id: 1, precioUnitario: 3000, nombre: 'ARROZ', codigo: 'P-1' },
        ]),
      createFactura: jest.fn().mockResolvedValue({ id: 10 }),
      createFacturaProducto: jest.fn().mockResolvedValue({ id: 20 }),
      findFacturaByIdWithRelations: jest
        .fn()
        .mockResolvedValue({ id: 10, codigoFactura: 'FAC-1' }),
    };
    repo.transaction.mockImplementation(async (callback: any) => callback(tx));
    storage.upload.mockRejectedValue(new Error('storage down'));

    const dto = {
      metodoPago: 'EFECTIVO',
      lugarCompra: 'TIENDA',
      items: [{ productoId: 1, cantidad: 2, descuento: 0 }],
    };
    const file = {
      buffer: Buffer.from('image'),
    } as Express.Multer.File;

    const result = await service.create(5, dto as any, file);

    expect(storage.upload).toHaveBeenCalled();
    expect(result.status).toBe(201);
  });
});
