import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../infra/storage/storage.service';
import { MailService } from '../infra/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { DomainConflictError } from '../common/errors/domain-conflict.error';
import { InvalidCredentialsError } from './errors/invalid-credentials.error';
import { ResetPasswordTokenInvalidError } from './errors/reset-password-token-invalid.error';
import { hashPasswordResetToken } from './utils/password-reset-token.util';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    usuario: {
      findFirst: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let jwtService: { sign: jest.Mock };
  let storage: { upload: jest.Mock };
  let mailService: { isConfigured: jest.Mock; sendMail: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    prisma = {
      usuario: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    jwtService = { sign: jest.fn() };
    storage = { upload: jest.fn() };
    mailService = { isConfigured: jest.fn(), sendMail: jest.fn() };
    configService = { get: jest.fn() };
    configService.get.mockImplementation(
      (key: string, defaultValue?: string | number) => {
        if (key === 'FRONTEND_URL') {
          return 'https://frontend.example.com';
        }

        return defaultValue;
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: StorageService, useValue: storage },
        { provide: MailService, useValue: mailService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a user successfully', async () => {
    prisma.usuario.findFirst.mockResolvedValue(null);
    prisma.usuario.create.mockResolvedValue({ id: 1 });
    storage.upload.mockResolvedValue('/uploads/users/user-photo.jpg');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    const dto = {
      tipoDocumento: 'CC',
      documento: '123',
      nombres: 'Juan',
      apellidos: 'Perez',
      correo: 'juan@test.com',
      contrasena: 'plain-pass',
    };

    const result = await service.register(dto, Buffer.from('img'), 'photo.jpg');

    expect(prisma.usuario.findFirst).toHaveBeenCalledWith({
      where: { OR: [{ correo: dto.correo }, { documento: dto.documento }] },
    });
    expect(storage.upload).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.stringContaining('user-'),
      'users',
    );
    expect(bcrypt.hash).toHaveBeenCalledWith(dto.contrasena, 10);
    expect(prisma.usuario.create).toHaveBeenCalled();
    expect(result).toEqual({
      status: 200,
      message: `Se registro con exito el usuario ${dto.nombres} ${dto.apellidos}`,
    });
  });

  it('should throw DomainConflictError when user already exists on register', async () => {
    prisma.usuario.findFirst.mockResolvedValue({ id: 10 });

    await expect(
      service.register({
        tipoDocumento: 'CC',
        documento: '123',
        nombres: 'Juan',
        apellidos: 'Perez',
        correo: 'juan@test.com',
        contrasena: 'plain-pass',
      }),
    ).rejects.toBeInstanceOf(DomainConflictError);

    expect(prisma.usuario.create).not.toHaveBeenCalled();
  });

  it('should login successfully and generate token', async () => {
    const dbUser = {
      id: 7,
      documento: '999',
      nombres: 'Ana',
      apellidos: 'Lopez',
      correo: 'ana@test.com',
      foto: null,
      fechaIngreso: new Date('2026-01-01T00:00:00.000Z'),
      monedaBase: 'COP',
      contrasena: 'hashed-db',
    };
    prisma.usuario.findUnique.mockResolvedValue(dbUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.sign.mockReturnValue('jwt-token');

    const result = await service.login({
      documento: '999',
      contrasena: 'plain-pass',
    });

    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { documento: '999' },
      select: {
        id: true,
        documento: true,
        nombres: true,
        apellidos: true,
        correo: true,
        foto: true,
        fechaIngreso: true,
        monedaBase: true,
        contrasena: true,
      },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith('plain-pass', 'hashed-db');
    expect(jwtService.sign).toHaveBeenCalledWith({ id: 7 });
    expect(result.token).toBe('jwt-token');
    expect(result.response.status).toBe(200);
  });

  it('should throw InvalidCredentialsError when user does not exist on login', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ documento: '111', contrasena: 'x' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('should throw InvalidCredentialsError when password is invalid', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      documento: '111',
      nombres: 'A',
      apellidos: 'B',
      correo: 'a@a.com',
      foto: null,
      fechaIngreso: new Date(),
      monedaBase: 'COP',
      contrasena: 'hashed',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({ documento: '111', contrasena: 'bad' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('should throw InternalServerErrorException on unexpected login error', async () => {
    prisma.usuario.findUnique.mockRejectedValue(new Error('db down'));

    await expect(
      service.login({ documento: '111', contrasena: 'x' }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('should return generic forgot password response when user does not exist', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);

    const result = await service.forgotPassword({ email: 'ghost@test.com' });

    expect(result).toEqual({
      status: 200,
      message: 'If the email exists, you will receive instructions.',
    });
    expect(prisma.usuario.update).not.toHaveBeenCalled();
    expect(mailService.sendMail).not.toHaveBeenCalled();
  });

  it('should store a hashed reset token and send email for forgot password', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 9,
      correo: 'ana@test.com',
      nombres: 'Ana',
    });
    prisma.usuario.update.mockResolvedValue({ id: 9 });
    mailService.isConfigured.mockReturnValue(true);
    mailService.sendMail.mockResolvedValue(true);

    const result = await service.forgotPassword({ email: 'ana@test.com' });

    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: {
        resetPasswordToken: expect.any(String),
        resetPasswordExpires: expect.any(Date),
        fechaUltimaEdicion: expect.any(Date),
      },
    });
    expect(mailService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'ana@test.com',
        subject: 'Reset your TrackMyExpenses password',
        text: expect.stringContaining(
          'https://frontend.example.com/reset-password?token=',
        ),
      }),
    );
    expect(result).toEqual({
      status: 200,
      message: 'If the email exists, you will receive instructions.',
    });
  });

  it('should clear reset fields when forgot password email delivery fails', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 11,
      correo: 'ana@test.com',
      nombres: 'Ana',
    });
    prisma.usuario.update.mockResolvedValue({ id: 11 });
    mailService.isConfigured.mockReturnValue(true);
    mailService.sendMail.mockRejectedValue(new Error('smtp down'));

    await service.forgotPassword({ email: 'ana@test.com' });

    expect(prisma.usuario.update).toHaveBeenNthCalledWith(1, {
      where: { id: 11 },
      data: {
        resetPasswordToken: expect.any(String),
        resetPasswordExpires: expect.any(Date),
        fechaUltimaEdicion: expect.any(Date),
      },
    });
    expect(prisma.usuario.update).toHaveBeenNthCalledWith(2, {
      where: { id: 11 },
      data: {
        resetPasswordToken: null,
        resetPasswordExpires: null,
        fechaUltimaEdicion: expect.any(Date),
      },
    });
  });

  it('should reset password and clear token when reset token is valid', async () => {
    const rawToken = 'valid-reset-token-1234567890abcdef';
    prisma.usuario.findFirst.mockResolvedValue({ id: 5 });
    prisma.usuario.update.mockResolvedValue({ id: 5 });
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');

    const result = await service.resetPassword({
      token: rawToken,
      newPassword: 'new-password-123',
    });

    expect(prisma.usuario.findFirst).toHaveBeenCalledWith({
      where: {
        resetPasswordToken: hashPasswordResetToken(rawToken),
        resetPasswordExpires: { gt: expect.any(Date) },
      },
      select: {
        id: true,
      },
    });
    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: {
        contrasena: 'new-hashed-password',
        resetPasswordToken: null,
        resetPasswordExpires: null,
        fechaUltimaEdicion: expect.any(Date),
      },
    });
    expect(result).toEqual({
      status: 200,
      message: 'Password updated successfully',
    });
  });

  it('should throw ResetPasswordTokenInvalidError when reset token is invalid', async () => {
    prisma.usuario.findFirst.mockResolvedValue(null);

    await expect(
      service.resetPassword({
        token: 'missing-reset-token-1234567890abcd',
        newPassword: 'new-password-123',
      }),
    ).rejects.toBeInstanceOf(ResetPasswordTokenInvalidError);
  });
});
