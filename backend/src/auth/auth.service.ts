import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { StorageService } from '../infra/storage/storage.service';

type LoginResult = {
  token: string;
  response: {
    status: number;
    message: string;
    user: {
      id: number;
      documento: string;
      nombres: string;
      apellidos: string;
      correo: string;
      foto: string | null;
      fechaIngreso: Date;
    };
  };
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private storage: StorageService,
  ) {}

  async register(
    dto: RegisterUserDto,
    fotoBuffer?: Buffer,
    fotoOriginalName?: string,
  ) {
    try {
      const {
        tipoDocumento,
        documento,
        nombres,
        apellidos,
        correo,
        contrasena,
      } = dto;

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
      if (fotoBuffer) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extMatch = fotoOriginalName?.match(/\.[^./\\]+$/);
        const ext = extMatch?.[0] ?? '';
        const filename = `users/user-${uniqueSuffix}${ext}`;
        fotoPath = await this.storage.upload(fotoBuffer, filename);
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
    } catch (error: unknown) {
      if (
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  async login(dto: LoginUserDto): Promise<LoginResult> {
    try {
      const { documento, contrasena } = dto;
      const user = await this.prisma.usuario.findUnique({
        where: { documento },
        select: {
          id: true,
          documento: true,
          nombres: true,
          apellidos: true,
          correo: true,
          foto: true,
          fechaIngreso: true,
          contrasena: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const isMatch = await bcrypt.compare(contrasena, user.contrasena);
      if (!isMatch) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const token = this.jwtService.sign({ id: user.id });

      return {
        token,
        response: {
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
        },
      };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Error interno del servidor',
      );
    }
  }
}
