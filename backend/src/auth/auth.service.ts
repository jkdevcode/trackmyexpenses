import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { StorageService } from '../infra/storage/storage.service';
import { MailService } from '../infra/mail/mail.service';
import { DomainConflictError } from '../common/errors/domain-conflict.error';
import { DomainForbiddenError } from '../common/errors/domain-forbidden.error';
import { InvalidCredentialsError } from './errors/invalid-credentials.error';
import { ResetPasswordTokenInvalidError } from './errors/reset-password-token-invalid.error';
import {
  createPasswordResetToken,
  hashPasswordResetToken,
  PASSWORD_RESET_TOKEN_TTL_MINUTES,
} from './utils/password-reset-token.util';

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
      monedaBase: string;
    };
  };
};

type GenericAuthResponse = {
  status: number;
  message: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private storage: StorageService,
    private mailService: MailService,
    private configService: ConfigService,
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
        monedaBase,
      } = dto;

      const exists = await this.prisma.usuario.findFirst({
        where: {
          OR: [{ correo }, { documento }],
        },
      });

      if (exists) {
        throw new DomainConflictError('Correo o documento ya registrados');
      }

      const hashedPassword = await bcrypt.hash(contrasena, 10);

      let fotoPath = null;
      if (fotoBuffer) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extMatch = fotoOriginalName?.match(/\.[^./\\]+$/);
        const ext = extMatch?.[0] ?? '';
        const filename = `user-${uniqueSuffix}${ext}`;
        fotoPath = await this.storage.upload(fotoBuffer, filename, 'users');
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
          monedaBase,
        },
      });

      if (!newUser.id) {
        throw new DomainForbiddenError('No se registro el usuario');
      }

      return {
        status: 200,
        message: `Se registro con exito el usuario ${nombres} ${apellidos}`,
      };
    } catch (error: unknown) {
      if (
        error instanceof DomainConflictError ||
        error instanceof DomainForbiddenError
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
          monedaBase: true,
          contrasena: true,
        },
      });

      if (!user) {
        throw new InvalidCredentialsError('Credenciales invalidas');
      }

      const isMatch = await bcrypt.compare(contrasena, user.contrasena);
      if (!isMatch) {
        throw new InvalidCredentialsError('Credenciales invalidas');
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
            monedaBase: user.monedaBase,
          },
        },
      };
    } catch (error: unknown) {
      if (error instanceof InvalidCredentialsError) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Error interno del servidor',
      );
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<GenericAuthResponse> {
    const response = {
      status: 200,
      message: 'If the email exists, you will receive instructions.',
    };
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.usuario.findUnique({
      where: { correo: email },
      select: {
        id: true,
        correo: true,
        nombres: true,
      },
    });

    if (!user) {
      return response;
    }

    if (!this.mailService.isConfigured()) {
      this.logger.warn(
        `Password reset requested for user ${user.id}, but SMTP is not configured.`,
      );
      return response;
    }

    const { rawToken, hashedToken, expiresAt } = createPasswordResetToken(
      PASSWORD_RESET_TOKEN_TTL_MINUTES,
    );

    await this.prisma.usuario.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expiresAt,
        fechaUltimaEdicion: new Date(),
      },
    });

    try {
      const delivered = await this.mailService.sendMail({
        to: user.correo,
        subject: 'Reset your TrackMyExpenses password',
        text: this.buildPasswordResetEmailText(user.nombres, rawToken),
        html: this.buildPasswordResetEmailHtml(user.nombres, rawToken),
      });

      if (!delivered) {
        await this.clearPasswordResetStateSafely(user.id);
      }
    } catch (error: unknown) {
      this.logger.error(
        `Failed to deliver password reset email for user ${user.id}`,
        error instanceof Error ? error.stack : undefined,
      );
      await this.clearPasswordResetStateSafely(user.id);
    }

    return response;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<GenericAuthResponse> {
    const hashedToken = hashPasswordResetToken(dto.token);
    const user = await this.prisma.usuario.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new ResetPasswordTokenInvalidError();
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.usuario.update({
      where: { id: user.id },
      data: {
        contrasena: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        fechaUltimaEdicion: new Date(),
      },
    });

    return {
      status: 200,
      message: 'Password updated successfully',
    };
  }

  private buildPasswordResetEmailText(name: string, rawToken: string): string {
    const greeting = name.trim() ? `Hello ${name.trim()},` : 'Hello,';

    return `${greeting}

We received a request to reset your TrackMyExpenses password.

Open this link to choose a new password:
${this.buildPasswordResetLink(rawToken)}

This link expires in ${PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes and can only be used once.

If you did not request this change, you can ignore this email.`;
  }

  private buildPasswordResetEmailHtml(name: string, rawToken: string): string {
    const greeting = name.trim() ? `Hello ${name.trim()},` : 'Hello,';
    const resetLink = this.buildPasswordResetLink(rawToken);

    return `
      <p>${greeting}</p>
      <p>We received a request to reset your TrackMyExpenses password.</p>
      <p>
        Open this link to choose a new password:<br />
        <a href="${resetLink}">${resetLink}</a>
      </p>
      <p>
        This link expires in ${PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes and can only be used once.
      </p>
      <p>If you did not request this change, you can ignore this email.</p>
    `;
  }

  private buildPasswordResetLink(rawToken: string): string {
    const frontendUrl = this.configService
      .get<string>('FRONTEND_URL', 'http://localhost:5173')
      .replace(/\/+$/, '');

    return `${frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
  }

  private async clearPasswordResetStateSafely(userId: number) {
    try {
      await this.prisma.usuario.update({
        where: { id: userId },
        data: {
          resetPasswordToken: null,
          resetPasswordExpires: null,
          fechaUltimaEdicion: new Date(),
        },
      });
    } catch (error: unknown) {
      this.logger.error(
        `Failed to clear password reset state for user ${userId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
