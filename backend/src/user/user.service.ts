import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { StorageService } from '../infra/storage/storage.service';
import { UserNotFoundError } from './errors/user-not-found.error';
import { DomainConflictError } from '../common/errors/domain-conflict.error';

const userSelect = {
  id: true,
  tipoDocumento: true,
  documento: true,
  nombres: true,
  apellidos: true,
  correo: true,
  rol: true,
  foto: true,
  fechaIngreso: true,
  fechaUltimaEdicion: true,
};

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async me(userId: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      status: 200,
      message: 'Perfil obtenido exitosamente',
      user,
    };
  }

  async updateProfile(
    userId: number,
    dto: UpdateUserDto,
    fileBuffer?: Buffer,
    originalName?: string,
  ) {
    if (dto.correo || dto.documento) {
      const orConditions: { correo?: string; documento?: string }[] = [];

      if (dto.correo) {
        orConditions.push({ correo: dto.correo });
      }

      if (dto.documento) {
        orConditions.push({ documento: dto.documento });
      }

      const exists = await this.prisma.usuario.findFirst({
        where: {
          OR: orConditions,
          NOT: { id: userId },
        },
        select: { id: true },
      });

      if (exists) {
        throw new DomainConflictError(
          'El correo o documento ya esta en uso por otro usuario',
        );
      }
    }

    const data: Prisma.UsuarioUpdateInput = {
      fechaUltimaEdicion: new Date(),
    };

    if (dto.nombres !== undefined) data.nombres = dto.nombres;
    if (dto.apellidos !== undefined) data.apellidos = dto.apellidos;
    if (dto.correo !== undefined) data.correo = dto.correo;
    if (dto.documento !== undefined) data.documento = dto.documento;

    if (fileBuffer) {
      try {
        const extMatch = originalName?.match(/\.[^./\\]+$/);
        const fileExt = extMatch?.[0] ?? '';
        const fileName = `${randomUUID()}${fileExt}`;
        data.foto = await this.storage.upload(fileBuffer, fileName);
      } catch {
        throw new InternalServerErrorException('Error al guardar la imagen');
      }
    } else if (dto.foto !== undefined) {
      data.foto = dto.foto;
    }

    try {
      const updated = await this.prisma.usuario.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          documento: true,
          nombres: true,
          apellidos: true,
          correo: true,
          foto: true,
          fechaUltimaEdicion: true,
        },
      });

      return {
        status: 200,
        message: 'Perfil actualizado exitosamente',
        user: updated,
      };
    } catch {
      throw new InternalServerErrorException('Error al actualizar el perfil');
    }
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        contrasena: true,
      },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.contrasena,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('La contrasena actual es incorrecta');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.usuario.update({
      where: { id: userId },
      data: {
        contrasena: hashedPassword,
        fechaUltimaEdicion: new Date(),
      },
    });

    return {
      status: 200,
      message: 'Contrasena actualizada exitosamente',
    };
  }

  async getAllUsers() {
    const users = await this.prisma.usuario.findMany({
      select: userSelect,
      orderBy: {
        fechaIngreso: 'desc',
      },
    });

    return {
      status: 200,
      message: 'Usuarios obtenidos exitosamente',
      users,
      total: users.length,
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      status: 200,
      message: 'Usuario obtenido exitosamente',
      user,
    };
  }

  async deleteUser(id: number) {
    const userExists = await this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!userExists) {
      throw new UserNotFoundError();
    }

    await this.prisma.usuario.delete({
      where: { id },
    });

    return {
      status: 200,
      message: 'Usuario eliminado exitosamente',
    };
  }
}
