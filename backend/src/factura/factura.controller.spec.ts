import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FacturaController } from './factura.controller';
import { FacturaOcrService } from './factura-ocr.service';
import { FacturaService } from './factura.service';

describe('FacturaController', () => {
  let controller: FacturaController;
  let facturaService: {
    findAll: jest.Mock;
    create: jest.Mock;
    getStats: jest.Mock;
    findOne: jest.Mock;
    addProducto: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };
  let facturaOcrService: {
    processImage: jest.Mock;
    confirmarFactura: jest.Mock;
  };

  beforeEach(async () => {
    facturaService = {
      findAll: jest.fn(),
      create: jest.fn(),
      getStats: jest.fn(),
      findOne: jest.fn(),
      addProducto: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    facturaOcrService = {
      processImage: jest.fn(),
      confirmarFactura: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacturaController],
      providers: [
        { provide: FacturaService, useValue: facturaService },
        { provide: FacturaOcrService, useValue: facturaOcrService },
      ],
    }).compile();

    controller = module.get<FacturaController>(FacturaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST /facturas/ocr should delegate file processing', async () => {
    const file = {
      buffer: Buffer.from('image-data'),
      mimetype: 'image/png',
      originalname: 'factura.png',
    } as Express.Multer.File;
    facturaOcrService.processImage.mockResolvedValue({
      rawText: 'OCR TEXT',
      parsed: { productos: [] },
      usedFallbackParser: true,
    });

    const result = await controller.uploadFile(file);

    expect(facturaOcrService.processImage).toHaveBeenCalledWith(file);
    expect(result).toEqual({
      rawText: 'OCR TEXT',
      parsed: { productos: [] },
      usedFallbackParser: true,
    });
  });

  it('POST /facturas/ocr should validate required file', async () => {
    await expect(
      controller.uploadFile(undefined as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('POST /facturas/ocr should reject invalid mimetype', async () => {
    await expect(
      controller.uploadFile({
        buffer: Buffer.from('text'),
        mimetype: 'text/plain',
      } as Express.Multer.File),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('POST /facturas/ocr/confirmar should call OCR service', async () => {
    const req = { user: { id: 15 } } as any;
    const dto = {
      factura: {
        fechaHoraCompra: '2026-03-06T10:00:00.000Z',
        metodoPago: 'EFECTIVO',
        lugarCompra: 'TIENDA',
      },
      productos: [
        {
          nombreDetectado: 'PAN',
          precioUnitario: 2500,
          cantidadDetectada: 2,
          unidadDetectada: 'u',
        },
      ],
    };
    facturaOcrService.confirmarFactura.mockResolvedValue({ status: 201 });

    const result = await controller.confirmarFactura(req, dto as any);

    expect(facturaOcrService.confirmarFactura).toHaveBeenCalledWith(15, dto);
    expect(result).toEqual({ status: 201 });
  });

  it('GET /facturas should call service.findAll with user and query params', async () => {
    const req = { user: { id: 20 } } as any;
    const query = { period: 'month', page: 1, limit: 20 };
    facturaService.findAll.mockResolvedValue({ status: 200, facturas: [] });

    const result = await controller.findAll(req, query as any);

    expect(facturaService.findAll).toHaveBeenCalledWith(20, 'month', 1, 20);
    expect(result).toEqual({ status: 200, facturas: [] });
  });

  it('PUT /facturas/:id should call service.update', async () => {
    const req = { user: { id: 10 } } as any;
    const dto = {
      metodoPago: 'EFECTIVO',
      items: [{ productoId: 1, precioUnitario: 2000 }],
    };
    facturaService.update.mockResolvedValue({ status: 200 });

    const result = await controller.update(5, dto as any, req);

    expect(facturaService.update).toHaveBeenCalledWith(10, 5, dto);
    expect(result).toEqual({ status: 200 });
  });

  it('DELETE /facturas/:id should call service.remove', async () => {
    const req = { user: { id: 3 } } as any;
    facturaService.remove.mockResolvedValue({ status: 200 });

    const result = await controller.remove(7, req);

    expect(facturaService.remove).toHaveBeenCalledWith(3, 7);
    expect(result).toEqual({ status: 200 });
  });
});
