import { Test, TestingModule } from '@nestjs/testing';
import { FACTURA_ERROR_CODES } from './errors/factura-error-codes';
import { FacturaDomainValidationError } from './factura.domain';
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

    const req = { user: { id: 1 } } as any;
    const result = await controller.uploadFile(file, req);

    expect(facturaOcrService.processImage).toHaveBeenCalledWith(file, 1);
    expect(result).toEqual({
      rawText: 'OCR TEXT',
      parsed: { productos: [] },
      usedFallbackParser: true,
    });
  });

  it('POST /facturas/ocr should validate required file', async () => {
    await expect(
      controller.uploadFile(undefined as any, {} as any),
    ).rejects.toMatchObject({
      code: FACTURA_ERROR_CODES.OCR_IMAGE_REQUIRED,
    });
  });

  it('POST /facturas/ocr should reject invalid mimetype', async () => {
    const promise = controller.uploadFile(
      {
        buffer: Buffer.from('text'),
        mimetype: 'text/plain',
      } as Express.Multer.File,
      {} as any,
    );

    await expect(promise).rejects.toBeInstanceOf(FacturaDomainValidationError);
    await expect(promise).rejects.toMatchObject({
      code: FACTURA_ERROR_CODES.UPLOAD_FILE_TYPE_INVALID,
    });
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

  it('POST /facturas should call service.create with optional file', async () => {
    const req = { user: { id: 4 } } as any;
    const dto = {
      metodoPago: 'EFECTIVO',
      lugarCompra: 'TIENDA',
      items: [{ productoId: 1, cantidad: 1 }],
    };
    const file = {
      buffer: Buffer.from('image-data'),
      mimetype: 'image/jpeg',
      size: 1024,
      originalname: 'factura.jpg',
    } as Express.Multer.File;
    facturaService.create.mockResolvedValue({ status: 201 });

    const result = await controller.create(req, dto as any, file);

    expect(facturaService.create).toHaveBeenCalledWith(4, dto, file);
    expect(result).toEqual({ status: 201 });
  });

  it('POST /facturas should reject invalid mimetype', async () => {
    const req = { user: { id: 4 } } as any;
    const dto = {
      metodoPago: 'EFECTIVO',
      lugarCompra: 'TIENDA',
      items: [{ productoId: 1, cantidad: 1 }],
    };

    const promise = controller.create(
      req,
      dto as any,
      {
        buffer: Buffer.from('text'),
        mimetype: 'image/webp',
        size: 1024,
      } as Express.Multer.File,
    );

    await expect(promise).rejects.toBeInstanceOf(FacturaDomainValidationError);
    await expect(promise).rejects.toMatchObject({
      code: FACTURA_ERROR_CODES.UPLOAD_FILE_TYPE_INVALID,
    });
  });

  it('GET /facturas should call service.findAll with user and query params', async () => {
    const req = { user: { id: 20 } } as any;
    const query = { period: 'month', page: 1, limit: 20 };
    facturaService.findAll.mockResolvedValue({ status: 200, facturas: [] });

    const result = await controller.findAll(req, query as any);

    expect(facturaService.findAll).toHaveBeenCalledWith(20, 'month', 1, 20, {
      startDate: undefined,
      endDate: undefined,
    });
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
