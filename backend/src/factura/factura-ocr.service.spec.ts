import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createWorker } from 'tesseract.js';
import { FacturaOcrService } from './factura-ocr.service';
import { FacturaService } from './factura.service';
import { ImageProcessorService } from './image-processor.service';
import { TextParserService } from './text-parser.service';

jest.mock('tesseract.js', () => ({
  createWorker: jest.fn(),
}));

describe('FacturaOcrService', () => {
  let service: FacturaOcrService;
  let facturaService: { createFromOcr: jest.Mock };
  let imageProcessor: { process: jest.Mock };
  let textParser: { parseAndEnrich: jest.Mock };
  let worker: { recognize: jest.Mock; terminate: jest.Mock };

  beforeEach(async () => {
    facturaService = { createFromOcr: jest.fn() };
    imageProcessor = { process: jest.fn() };
    textParser = { parseAndEnrich: jest.fn() };
    worker = {
      recognize: jest.fn(),
      terminate: jest.fn(),
    };

    (createWorker as jest.Mock).mockResolvedValue(worker);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturaOcrService,
        { provide: FacturaService, useValue: facturaService },
        { provide: ImageProcessorService, useValue: imageProcessor },
        { provide: TextParserService, useValue: textParser },
      ],
    }).compile();

    service = module.get<FacturaOcrService>(FacturaOcrService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should process image and extract/parse text', async () => {
    await service.onModuleInit();

    imageProcessor.process.mockResolvedValue(Buffer.from('processed'));
    worker.recognize.mockResolvedValue({ data: { text: 'OCR TEXT' } });
    textParser.parseAndEnrich.mockResolvedValue({
      parsed: { productos: [{ nombreDetected: 'ARROZ' }] },
      usedFallbackParser: false,
    });

    const file = {
      buffer: Buffer.from('raw'),
      mimetype: 'image/jpeg',
      originalname: 'factura.jpg',
    } as Express.Multer.File;

    const result = await service.processImage(file);

    expect(imageProcessor.process).toHaveBeenCalledWith(file.buffer);
    expect(worker.recognize).toHaveBeenCalledWith(Buffer.from('processed'));
    expect(textParser.parseAndEnrich).toHaveBeenCalledWith('OCR TEXT');
    expect(result).toEqual({
      rawText: 'OCR TEXT',
      parsed: { productos: [{ nombreDetected: 'ARROZ' }] },
      usedFallbackParser: false,
    });
  });

  it('should throw InternalServerErrorException when OCR processing fails', async () => {
    await service.onModuleInit();
    imageProcessor.process.mockRejectedValue(new Error('sharp failed'));

    await expect(
      service.processImage({
        buffer: Buffer.from('raw'),
      } as Express.Multer.File),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('should delegate confirmarFactura to facturaService.createFromOcr', async () => {
    const dto = {
      factura: {
        fechaHoraCompra: '2026-03-05T10:00:00.000Z',
        metodoPago: 'EFECTIVO',
        lugarCompra: 'TIENDA',
      },
      productos: [{ nombreDetectado: 'LECHE', precioUnitario: 5000 }],
    };
    facturaService.createFromOcr.mockResolvedValue({ status: 201 });

    const result = await service.confirmarFactura(10, dto as any);

    expect(facturaService.createFromOcr).toHaveBeenCalledWith(10, dto);
    expect(result).toEqual({ status: 201 });
  });

  it('should terminate worker on module destroy', async () => {
    await service.onModuleInit();

    await service.onModuleDestroy();

    expect(worker.terminate).toHaveBeenCalled();
  });
});
