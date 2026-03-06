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
    const dto = { codigo: 'P-1', nombre: 'Arroz', precioUnitario: 20 };
    productoService.create.mockResolvedValue({ status: 201 });

    const result = await controller.create(dto);

    expect(productoService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ status: 201 });
  });

  it('should call service.findAll', async () => {
    productoService.findAll.mockResolvedValue({ status: 200, productos: [] });

    const result = await controller.findAll();

    expect(productoService.findAll).toHaveBeenCalled();
    expect(result).toEqual({ status: 200, productos: [] });
  });
});
