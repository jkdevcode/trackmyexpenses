import { Test, TestingModule } from '@nestjs/testing';
import { ProductoController } from './producto.controller';
import { ProductoService } from './producto.service';

describe('ProductoController', () => {
  let controller: ProductoController;
  let productoService: {
    create: jest.Mock;
    findAll: jest.Mock;
  };

  beforeEach(async () => {
    productoService = {
      create: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductoController],
      providers: [{ provide: ProductoService, useValue: productoService }],
    }).compile();

    controller = module.get<ProductoController>(ProductoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create', async () => {
    const req = { user: { id: 7 } } as any;
    const dto = { codigo: 'P-1', nombre: 'Arroz', precioUnitario: 20 };
    productoService.create.mockResolvedValue({ status: 201 });

    const result = await controller.create(req, dto);

    expect(productoService.create).toHaveBeenCalledWith(7, dto);
    expect(result).toEqual({ status: 201 });
  });

  it('should call service.findAll', async () => {
    const req = { user: { id: 7 } } as any;
    productoService.findAll.mockResolvedValue({ status: 200, productos: [] });

    const result = await controller.findAll(req);

    expect(productoService.findAll).toHaveBeenCalledWith(7);
    expect(result).toEqual({ status: 200, productos: [] });
  });
});
