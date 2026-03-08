import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
  };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    };
    configService = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(typeof controller.register).toBe('function');
    expect(typeof controller.login).toBe('function');
    expect(typeof controller.logout).toBe('function');
  });

  it('should call authService.register with dto and uploaded file info', async () => {
    const dto = {
      tipoDocumento: 'CC',
      documento: '123',
      nombres: 'Juan',
      apellidos: 'Perez',
      correo: 'juan@test.com',
      contrasena: 'secret',
    };
    const file = {
      buffer: Buffer.from('file'),
      originalname: 'foto.jpg',
    } as Express.Multer.File;
    authService.register.mockResolvedValue({ status: 200 });

    const result = await controller.register(dto, file);

    expect(authService.register).toHaveBeenCalledWith(
      dto,
      file.buffer,
      file.originalname,
    );
    expect(result).toEqual({ status: 200 });
  });

  it('should call authService.login and set cookie', async () => {
    const dto = { documento: '123', contrasena: 'secret' };
    const serviceResponse = {
      token: 'jwt-token',
      response: { status: 200, message: 'Login exitoso', user: { id: 1 } },
    };
    authService.login.mockResolvedValue(serviceResponse);
    configService.get.mockImplementation(
      (key: string, defaultValue?: string) => {
        if (key === 'JWT_EXPIRES_IN') return '7d';
        if (key === 'NODE_ENV') return 'test';
        return defaultValue;
      },
    );
    const cookie = jest.fn();
    const res = { cookie } as unknown as Response;

    const result = await controller.login(dto, res);

    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(configService.get).toHaveBeenCalledWith('JWT_EXPIRES_IN', '7d');
    expect(cookie).toHaveBeenCalledWith(
      'token',
      'jwt-token',
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 604800000,
      }),
    );
    expect(result).toEqual(serviceResponse.response);
  });

  it('should clear auth cookie on logout', () => {
    configService.get.mockImplementation(
      (key: string, defaultValue?: string) => {
        if (key === 'NODE_ENV') return 'test';
        return defaultValue;
      },
    );
    const clearCookie = jest.fn();
    const res = { clearCookie } as unknown as Response;

    const result = controller.logout(res);

    expect(clearCookie).toHaveBeenCalledWith(
      'token',
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
      }),
    );
    expect(result).toEqual({ status: 200, message: 'Logout exitoso' });
  });
});
