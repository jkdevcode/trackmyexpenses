import { Injectable, NotFoundException, UnauthorizedException, ConflictException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

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

  async updateProfile(userId: number, dto: UpdateUserDto, file?: Express.Multer.File) {
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

    // 3. Manejar la subida de la foto si existe
    if (file) {
      const uploadDir = path.join(process.cwd(), 'uploads');

      // Asegurar que la carpeta existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generar nombre de archivo único
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      try {
        fs.writeFileSync(filePath, file.buffer);
        data.foto = `/uploads/${fileName}`;
      } catch (error) {
        console.error('Error saving file:', error);
        throw new InternalServerErrorException('Error al guardar la imagen');
      }
    } else if (dto.foto !== undefined) {
      // Si no hay archivo pero viene una URL/string en el DTO (ej. borrar foto)
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
    } catch (error: any) {
      throw new InternalServerErrorException('Error al actualizar el perfil');
    }
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.contrasena);
    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Actualizar contraseña
    await this.prisma.usuario.update({
      where: { id: userId },
      data: {
        contrasena: hashedPassword,
        fechaUltimaEdicion: new Date(),
      },
    });

    return {
      status: 200,
      message: 'Contraseña actualizada exitosamente',
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
