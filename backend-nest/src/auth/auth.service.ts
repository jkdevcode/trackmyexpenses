import { Injectable, ConflictException, UnauthorizedException, ForbiddenException, InternalServerErrorException, Body, UploadedFile } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async register(
    @Body() dto: RegisterUserDto,
    @UploadedFile() foto?: Express.Multer.File
  ) {
    try {
      const { tipoDocumento, documento, nombres, apellidos, correo, contrasena } = dto;

      const exists = await this.prisma.usuario.findFirst({
        where: {
          OR: [{ correo }, { documento }],
        },
      });

      if (exists) {
        throw new ConflictException('Correo o documento ya registrados');
      }

      const hashedPassword = await bcrypt.hash(contrasena, 10); // BCRYPT_SALT_ROUNDS=10

      let fotoPath = null;
      if (foto) {
        const fs = await import('fs');
        const path = await import('path');
        const uploadDir = path.join(process.cwd(), 'uploads', 'users');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(foto.originalname);
        const filename = `user-${uniqueSuffix}${ext}`;
        fs.writeFileSync(path.join(uploadDir, filename), foto.buffer);
        fotoPath = `/uploads/users/${filename}`;
      }

      const newUser = await this.prisma.usuario.create({
        data: {
          tipoDocumento,
          documento,
          nombres,
          apellidos,
          correo,
          contrasena: hashedPassword,
          foto: fotoPath,
          fechaIngreso: new Date(),
        },
      });

      if (!newUser.id) {
        throw new ForbiddenException('No se registró el usuario');
      }

      return {
        status: 200,
        message: `Se registró con éxito el usuario ${nombres} ${apellidos}`,
      };

    } catch (error) {
      if (error instanceof ConflictException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async login(dto: LoginUserDto) {
    try {
      const { documento, contrasena } = dto;
      const user = await this.prisma.usuario.findUnique({ where: { documento } });

      if (!user) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const isMatch = await bcrypt.compare(contrasena, user.contrasena);
      if (!isMatch) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const token = this.jwtService.sign({ id: user.id });

      return {
        status: 200,
        message: 'Login exitoso',
        user: {
          id: user.id,
          documento: user.documento,
          nombres: user.nombres,
          apellidos: user.apellidos,
          correo: user.correo,
          foto: user.foto,
          fechaIngreso: user.fechaIngreso,
        },
        token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
