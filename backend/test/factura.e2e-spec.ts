import {
  INestApplication,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

jest.mock('../src/auth/jwt-auth.guard', () => ({
  JwtAuthGuard: class MockJwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 42 };
      return true;
    }
  },
}));

import { FacturaController } from '../src/factura/factura.controller';
import { FacturaService } from '../src/factura/factura.service';
import { FacturaOcrService } from '../src/factura/factura-ocr.service';

describe('FacturaController (e2e)', () => {
  let app: INestApplication;
  let facturaService: { findAll: jest.Mock };
  let facturaOcrService: {
    processImage: jest.Mock;
    confirmarFactura: jest.Mock;
  };

  beforeAll(async () => {
    facturaService = {
      findAll: jest.fn(),
    };
    facturaOcrService = {
      processImage: jest.fn(),
      confirmarFactura: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FacturaController],
      providers: [
        { provide: FacturaService, useValue: facturaService },
        { provide: FacturaOcrService, useValue: facturaOcrService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /facturas/ocr (scan) should process image', async () => {
    facturaOcrService.processImage.mockResolvedValue({
      rawText: 'ARROZ 5.000',
      parsed: { productos: [{ nombreDetected: 'ARROZ', precioTotal: 5000 }] },
      usedFallbackParser: true,
    });

    await request(app.getHttpServer())
      .post('/facturas/ocr')
      .attach('image', Buffer.from('fake-image'), 'factura.png')
      .expect(201)
      .expect((res) => {
        expect(res.body.rawText).toBe('ARROZ 5.000');
        expect(res.body.parsed.productos).toHaveLength(1);
      });

    expect(facturaOcrService.processImage).toHaveBeenCalled();
  });

  it('POST /facturas/ocr/confirmar (confirm) should confirm factura', async () => {
    facturaOcrService.confirmarFactura.mockResolvedValue({
      status: 201,
      message: 'Factura OCR confirmada exitosamente',
      data: { factura: { id: 100 } },
    });

    await request(app.getHttpServer())
      .post('/facturas/ocr/confirmar')
      .send({
        factura: {
          fechaHoraCompra: '2026-03-05T10:00:00.000Z',
          metodoPago: 'EFECTIVO',
          lugarCompra: 'SUPERMERCADO',
        },
        productos: [
          {
            nombreDetectado: 'LECHE',
            precioUnitario: 5000,
            cantidadDetectada: 1,
            unidadDetectada: 'u',
            descuentoDetectado: 0,
          },
        ],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.status).toBe(201);
        expect(res.body.data.factura.id).toBe(100);
      });

    expect(facturaOcrService.confirmarFactura).toHaveBeenCalledWith(
      42,
      expect.any(Object),
    );
  });

  it('GET /facturas should return factura list', async () => {
    facturaService.findAll.mockResolvedValue({
      status: 200,
      message: 'Facturas obtenidas exitosamente',
      data: [{ id: 1 }],
      facturas: [{ id: 1 }],
      pagination: { page: 1, limit: 20, total: 1 },
      stats: {
        currentPeriodInvoices: 1,
        totalSpending: 10000,
        spendingTrend: 0,
        totalInvoices: 1,
      },
    });

    await request(app.getHttpServer())
      .get('/facturas?period=month&page=1&limit=20')
      .expect(200)
      .expect((res) => {
        expect(res.body.facturas).toEqual([{ id: 1 }]);
        expect(res.body.pagination.total).toBe(1);
      });

    expect(facturaService.findAll).toHaveBeenCalledWith(42, 'month', 1, 20);
  });
});
