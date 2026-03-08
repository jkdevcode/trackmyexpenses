import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TextParserService } from './text-parser.service';

describe('TextParserService', () => {
  let service: TextParserService;
  let prisma: { producto: { findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      producto: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextParserService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<TextParserService>(TextParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extract one item from OCR text with fallback parser', async () => {
    prisma.producto.findMany.mockResolvedValue([]);

    const rawText = `
      SUPERMERCADO XYZ
      ARROZ DIANA 5.000
      TOTAL 5.000
    `;

    const result = await service.parseAndEnrich(rawText);

    expect(result.usedFallbackParser).toBe(true);
    expect(result.parsed.productos).toHaveLength(1);
    expect(result.parsed.productos[0]).toEqual(
      expect.objectContaining({
        nombreDetected: 'ARROZ DIANA',
        precioTotal: 5000,
        precioUnitario: 5000,
        cantidad: 1,
      }),
    );
  });

  it('should detect prices and quantities from OCR lines', async () => {
    prisma.producto.findMany.mockResolvedValue([]);

    const rawText = `
      TIENDA
      AZUCAR 2kg 8.000
    `;

    const result = await service.parseAndEnrich(rawText);
    const item = result.parsed.productos[0];

    expect(item.precioTotal).toBe(8000);
    expect(item.cantidad).toBe(2);
    expect(item.unidad).toBe('kg');
    expect(item.precioUnitario).toBe(4000);
  });

  it('should parse multiple items from OCR text', async () => {
    prisma.producto.findMany.mockResolvedValue([]);

    const rawText = `
      PAN INTEGRAL 4.500
      LECHE ENTERA 3.200
      HUEVOS AA 12.000
    `;

    const result = await service.parseAndEnrich(rawText);

    expect(result.parsed.productos).toHaveLength(3);
    expect(result.parsed.productos.map((p) => p.nombreDetected)).toEqual([
      'PAN INTEGRAL',
      'LECHE ENTERA',
      'HUEVOS AA',
    ]);
  });
});
