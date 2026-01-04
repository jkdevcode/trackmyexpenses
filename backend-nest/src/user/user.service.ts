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
  constructor(private prisma: PrismaService) { }

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
    // 1. Validar si el correo o documento ya existen para otro usuario
    if (dto.correo || dto.documento) {
      const exists = await this.prisma.usuario.findFirst({
        where: {
          OR: [
            dto.correo ? { correo: dto.correo } : undefined,
            dto.documento ? { documento: dto.documento } : undefined,
          ].filter(Boolean) as any,
          NOT: { id: userId },
        },
      });

      if (exists) {
        throw new ConflictException('El correo o documento ya está en uso por otro usuario');
      }
    }

    // 2. Construir el objeto data dinámicamente para actualización parcial (seguridad)
    const data: any = {
      fechaUltimaEdicion: new Date(),
    };

    if (dto.nombres !== undefined) data.nombres = dto.nombres;
    if (dto.apellidos !== undefined) data.apellidos = dto.apellidos;
    if (dto.correo !== undefined) data.correo = dto.correo;
    if (dto.documento !== undefined) data.documento = dto.documento;
    if (dto.foto !== undefined) data.foto = dto.foto;

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
    } catch (error: any) {
      throw new InternalServerErrorException('Error al actualizar el perfil');
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
