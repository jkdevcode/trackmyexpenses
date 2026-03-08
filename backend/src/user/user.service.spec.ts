import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../infra/storage/storage.service';
import { UserNotFoundError } from './errors/user-not-found.error';
import { DomainConflictError } from '../common/errors/domain-conflict.error';

describe('UserService', () => {
  let service: UserService;
  let prisma: {
    usuario: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
      delete: jest.Mock;
    };
  };
  let storage: { upload: jest.Mock };

  beforeEach(async () => {
    prisma = {
      usuario: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
    };
    storage = { upload: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find user by id (findOne)', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      nombres: 'Juan',
      apellidos: 'Perez',
    });

    const result = await service.findOne(1);

    expect(prisma.usuario.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
      }),
    );
    expect(result.status).toBe(200);
    expect(result.message).toBe('Usuario obtenido exitosamente');
    expect(result.user.id).toBe(1);
  });

  it('should throw UserNotFoundError when findOne user does not exist', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it('should update user profile successfully', async () => {
    prisma.usuario.findFirst.mockResolvedValue(null);
    storage.upload.mockResolvedValue('/uploads/users/new-photo.jpg');
    prisma.usuario.update.mockResolvedValue({
      id: 1,
      documento: '123',
      nombres: 'Nuevo',
      apellidos: 'Nombre',
      correo: 'nuevo@test.com',
      foto: '/uploads/users/new-photo.jpg',
      fechaUltimaEdicion: new Date(),
    });

    const dto = {
      nombres: 'Nuevo',
      apellidos: 'Nombre',
      correo: 'nuevo@test.com',
      documento: '123',
    };
    const result = await service.updateProfile(
      1,
      dto,
      Buffer.from('img'),
      'avatar.png',
    );

    expect(prisma.usuario.findFirst).toHaveBeenCalled();
    expect(storage.upload).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.stringMatching(/\.png$/),
    );
    const [updateInput] = prisma.usuario.update.mock.calls[0] as [
      {
        where: { id: number };
        data: {
          nombres?: string;
          apellidos?: string;
          correo?: string;
          documento?: string;
        };
      },
    ];
    expect(updateInput.where.id).toBe(1);
    expect(updateInput.data.nombres).toBe('Nuevo');
    expect(updateInput.data.apellidos).toBe('Nombre');
    expect(updateInput.data.correo).toBe('nuevo@test.com');
    expect(updateInput.data.documento).toBe('123');
    expect(result.status).toBe(200);
  });

  it('should throw DomainConflictError when update profile has duplicated correo/documento', async () => {
    prisma.usuario.findFirst.mockResolvedValue({ id: 2 });

    await expect(
      service.updateProfile(1, { correo: 'duplicado@test.com' }),
    ).rejects.toBeInstanceOf(DomainConflictError);
    expect(prisma.usuario.update).not.toHaveBeenCalled();
  });

  it('should throw InternalServerErrorException when storage upload fails', async () => {
    prisma.usuario.findFirst.mockResolvedValue(null);
    storage.upload.mockRejectedValue(new Error('storage down'));

    await expect(
      service.updateProfile(1, {}, Buffer.from('img'), 'avatar.png'),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
