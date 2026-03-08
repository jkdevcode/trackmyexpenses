import { Test, TestingModule } from '@nestjs/testing';
import { AppRole } from '../auth/roles.enum';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  type RequestWithUserArg = Parameters<UserController['me']>[0];
  let userService: {
    getAllUsers: jest.Mock;
    me: jest.Mock;
    findOne: jest.Mock;
    changePassword: jest.Mock;
    updateProfile: jest.Mock;
    deleteUser: jest.Mock;
  };

  beforeEach(async () => {
    userService = {
      getAllUsers: jest.fn(),
      me: jest.fn(),
      findOne: jest.fn(),
      changePassword: jest.fn(),
      updateProfile: jest.fn(),
      deleteUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getAllUsers on findAll', async () => {
    userService.getAllUsers.mockResolvedValue({ status: 200, users: [] });

    const result = await controller.findAll();

    expect(userService.getAllUsers).toHaveBeenCalled();
    expect(result).toEqual({ status: 200, users: [] });
  });

  it('should call me with request user id', async () => {
    userService.me.mockResolvedValue({ status: 200, user: { id: 1 } });
    const req = {
      user: { id: 1, rol: AppRole.ADMIN },
    } as unknown as RequestWithUserArg;

    const result = await controller.me(req);

    expect(userService.me).toHaveBeenCalledWith(1);
    expect(result).toEqual({ status: 200, user: { id: 1 } });
  });

  it('should call findOne with id', async () => {
    userService.findOne.mockResolvedValue({ status: 200, user: { id: 5 } });

    const result = await controller.findOne(5);

    expect(userService.findOne).toHaveBeenCalledWith(5);
    expect(result).toEqual({ status: 200, user: { id: 5 } });
  });

  it('should call changePassword with request user id and dto', async () => {
    const dto = {
      currentPassword: 'old',
      newPassword: 'new',
      confirmPassword: 'new',
    };
    const req = {
      user: { id: 10, rol: AppRole.USER },
    } as unknown as RequestWithUserArg;
    userService.changePassword.mockResolvedValue({ status: 200 });

    const result = await controller.changePassword(dto, req);

    expect(userService.changePassword).toHaveBeenCalledWith(10, dto);
    expect(result).toEqual({ status: 200 });
  });

  it('should call updateProfile with file data', async () => {
    const dto = { nombres: 'Nuevo' };
    const file = {
      buffer: Buffer.from('img'),
      originalname: 'avatar.jpg',
    } as Express.Multer.File;
    userService.updateProfile.mockResolvedValue({ status: 200 });

    const result = await controller.update(4, dto, file);

    expect(userService.updateProfile).toHaveBeenCalledWith(
      4,
      dto,
      file.buffer,
      file.originalname,
    );
    expect(result).toEqual({ status: 200 });
  });

  it('should call deleteUser with target id', async () => {
    userService.deleteUser.mockResolvedValue({ status: 200 });

    const result = await controller.remove(9);

    expect(userService.deleteUser).toHaveBeenCalledWith(9);
    expect(result).toEqual({ status: 200 });
  });
});
