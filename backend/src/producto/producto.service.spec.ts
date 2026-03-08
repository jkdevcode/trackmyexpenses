import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ProductoService } from './producto.service';
import { PrismaService } from '../prisma/prisma.service';
import { DomainConflictError } from '../common/errors/domain-conflict.error';
import { ProductoNotFoundError } from './errors/producto-not-found.error';

describe('ProductoService', () => {
  let service: ProductoService;
  let prisma: {
    producto: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let logger: { error: jest.Mock };

  beforeEach(async () => {
    prisma = {
      producto: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };
    logger = { error: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoService,
        { provide: PrismaService, useValue: prisma },
        { provide: Logger, useValue: logger },
      ],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create producto successfully', async () => {
    prisma.producto.findUnique.mockResolvedValue(null);
    prisma.producto.create.mockResolvedValue({
      id: 1,
      codigo: 'P-1',
      nombre: 'Arroz',
      precioUnitario: 20,
    });

    const dto = { codigo: 'P-1', nombre: 'Arroz', precioUnitario: 20 };
    const result = await service.create(dto);

    expect(prisma.producto.findUnique).toHaveBeenCalledWith({
      where: { codigo: 'P-1' },
    });
    expect(prisma.producto.create).toHaveBeenCalledWith({
      data: dto,
    });
    expect(result.status).toBe(201);
  });

  it('should throw DomainConflictError when producto code already exists', async () => {
    prisma.producto.findUnique.mockResolvedValue({ id: 2, codigo: 'P-1' });

    await expect(
      service.create({ codigo: 'P-1', nombre: 'Arroz', precioUnitario: 20 }),
    ).rejects.toBeInstanceOf(DomainConflictError);
  });

  it('should list productos', async () => {
    prisma.producto.findMany.mockResolvedValue([
      { id: 1, codigo: 'P-1', nombre: 'Arroz', precioUnitario: 20 },
    ]);

    const result = await service.findAll();

    expect(prisma.producto.findMany).toHaveBeenCalledWith({
      orderBy: { nombre: 'asc' },
    });
    expect(result).toEqual({
      status: 200,
      message: 'Productos obtenidos exitosamente',
      productos: [
        { id: 1, codigo: 'P-1', nombre: 'Arroz', precioUnitario: 20 },
      ],
      total: 1,
    });
  });

  it('should throw ProductoNotFoundError when producto does not exist', async () => {
    prisma.producto.findUnique.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toBeInstanceOf(
      ProductoNotFoundError,
    );
  });

  it('should throw InternalServerErrorException when listing fails', async () => {
    prisma.producto.findMany.mockRejectedValue(new Error('db error'));

    await expect(service.findAll()).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    expect(logger.error).toHaveBeenCalled();
  });
});
