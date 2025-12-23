import { Injectable, NotFoundException, ConflictException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

// Define explicit select object to reuse and ensure password exclusion
const userSelect = {
  id: true,
  tipoDocumento: true,
  documento: true,
  nombres: true,
  apellidos: true,
  correo: true,
  foto: true,
  fechaIngreso: true,
  fechaUltimaEdicion: true,
};

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async me(userId: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      status: 200,
      message: 'Perfil obtenido exitosamente',
      user,
    };
  }

  async updateProfile(userId: number, dto: UpdateUserDto) {
    try {
      const updated = await this.prisma.usuario.update({
        where: { id: userId },
        data: {
          ...dto,
          fechaUltimaEdicion: new Date(),
        },
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
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Correo o documento ya está en uso');
      }
      throw new InternalServerErrorException('Error al actualizar perfil');
    }
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
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
       status: 200,
       message: 'Usuario obtenido exitosamente',
       user
    };
  }

  async deleteUser(id: number, currentUserId: number) {
    if (isNaN(id)) {
      // NestJS param parsing usually handles this if ParseIntPipe is used, 
      // but logic requires manually checking in some cases if pipe not strict.
      // We will rely on Controller Pipe.
    }

    const userExists = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!userExists) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (id === currentUserId) {
      throw new ForbiddenException('No puedes eliminar tu propia cuenta');
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
