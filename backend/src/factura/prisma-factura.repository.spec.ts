import { Prisma } from '@prisma/client';
import { DomainConflictError } from '../common/errors/domain-conflict.error';
import { PrismaFacturaRepository } from './prisma-factura.repository';

describe('PrismaFacturaRepository', () => {
  let repository: PrismaFacturaRepository;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(),
      $queryRaw: jest.fn(),
      factura: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
      },
      producto: {
        findFirst: jest.fn(),
      },
      usuario: {
        findUnique: jest.fn(),
      },
    };

    repository = new PrismaFacturaRepository(prisma);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should map findFacturasByUserAndRange query params correctly', async () => {
    prisma.factura.findMany.mockResolvedValue([{ id: 1 }]);
    const startDate = new Date('2026-03-01T00:00:00.000Z');
    const endDate = new Date('2026-03-31T23:59:59.999Z');

    const result = await repository.findFacturasByUserAndRange(
      7,
      { startDate, endDate },
      2,
      10,
    );

    expect(prisma.factura.findMany).toHaveBeenCalledWith({
      where: {
        usuarioId: 7,
        fechaHoraCompra: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { fechaHoraCompra: 'desc' },
      skip: 10,
      take: 10,
      select: expect.any(Object),
    });
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should convert aggregate totalPagar to number', async () => {
    prisma.$queryRaw.mockResolvedValue([
      { total: new Prisma.Decimal('12345.67') },
    ]);

    const result = await repository.sumTotalPagarByUserAndRange(1, {
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-01-31T23:59:59.999Z'),
    });

    expect(result).toBe(12345.67);
  });

  it('should execute transaction callback with tx repository', async () => {
    const txMock = {
      producto: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { id: 1, precioUnitario: 1000, nombre: 'AZUCAR', codigo: 'P-1' },
          ]),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      factura: {
        create: jest.fn().mockResolvedValue({ id: 10 }),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
      },
      facturaProducto: {
        create: jest.fn().mockResolvedValue({ id: 20 }),
      },
    };

    prisma.$transaction.mockImplementation((cb: any) => cb(txMock));

    const result = await repository.transaction(async (tx) => {
      return tx.findProductosByIds(7, [1]);
    });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result).toEqual([
      { id: 1, precioUnitario: 1000, nombre: 'AZUCAR', codigo: 'P-1' },
    ]);
  });

  it('should map Prisma unique constraint error to DomainConflictError in createFacturaProducto', async () => {
    const txMock = {
      producto: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      factura: {
        create: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
      },
      facturaProducto: {
        create: jest.fn(),
      },
    };

    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: 'test', meta: {} },
    );
    txMock.facturaProducto.create.mockRejectedValue(prismaError);
    prisma.$transaction.mockImplementation((cb: any) => cb(txMock));

    await expect(
      repository.transaction((tx) =>
        tx.createFacturaProducto({
          facturaId: 1,
          productoId: 1,
          cantidad: 1,
          descuento: 0,
          precioUnitario: 1000,
          precioTotal: 1000,
          productoNombre: 'AZUCAR',
          productoCodigo: 'P-1',
        }),
      ),
    ).rejects.toBeInstanceOf(DomainConflictError);
  });
});
