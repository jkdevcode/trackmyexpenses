import {
  Controller,
  Post,
  Body,
  HttpCode,
  UsePipes,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { parseJwtExpiryToMs } from './utils/parse-jwt-expiry.util';
import {
  AUTH_COOKIE_NAME,
  buildAuthCookieOptions,
} from './utils/auth-cookie-options.util';
import {
  imageFileInterceptorOptions,
  optionalImageFilePipe,
} from '../common/upload/upload-options';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('foto', imageFileInterceptorOptions))
  @ApiOperation({ summary: 'Register a new user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'User registration payload with optional photo',
    type: RegisterUserDto,
  })
  @ApiCreatedResponse({ description: 'User successfully registered.' })
  @ApiBadRequestResponse({ description: 'Invalid registration details.' })
  async register(
    @Body() dto: RegisterUserDto,
    @UploadedFile(optionalImageFilePipe) foto?: Express.Multer.File,
  ) {
    return this.authService.register(dto, foto?.buffer, foto?.originalname);
  }

  @Post('login')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Authenticate a user and issue the auth cookie',
    description:
      'Validates the document number and password, returns the user profile, and sets the HttpOnly `token` cookie used by protected endpoints.',
  })
  @ApiBody({
    type: LoginUserDto,
    examples: {
      default: {
        summary: 'Login request',
        value: {
          documento: '12345678',
          contrasena: 'SecurePass123',
        },
      },
    },
  })
  @ApiOkResponse({
    description:
      'Authenticated user payload. The response also sets the HttpOnly `token` cookie.',
    headers: {
      'Set-Cookie': {
        description: 'HttpOnly JWT cookie named `token`.',
        schema: { type: 'string' },
      },
    },
    schema: {
      example: {
        status: 200,
        message: 'Login exitoso',
        user: {
          id: 7,
          documento: '12345678',
          nombres: 'Ana',
          apellidos: 'Lopez',
          correo: 'ana@example.com',
          foto: null,
          fechaIngreso: '2026-04-08T13:20:14.000Z',
          monedaBase: 'COP',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid login payload.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid document number or password.',
  })
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, response } = await this.authService.login(dto);
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    const cookieOptions = buildAuthCookieOptions(
      parseJwtExpiryToMs(expiresIn),
      isProduction,
    );

    res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);

    return response;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout a user' })
  @ApiOkResponse({
    description: 'User successfully logged out, clearing the auth cookie.',
  })
  logout(@Res({ passthrough: true }) res: Response) {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    res.clearCookie(
      AUTH_COOKIE_NAME,
      buildAuthCookieOptions(undefined, isProduction),
    );

    return {
      status: 200,
      message: 'Logout exitoso',
    };
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Request a password reset link',
    description:
      'Accepts the account email, stores a hashed reset token with expiration, and sends a reset link when SMTP is configured. The response is always generic to avoid email enumeration.',
  })
  @ApiBody({
    type: ForgotPasswordDto,
    examples: {
      default: {
        summary: 'Forgot password request',
        value: {
          email: 'ana@example.com',
        },
      },
    },
  })
  @ApiOkResponse({
    description:
      'Generic response returned whether or not the email exists in the system.',
    schema: {
      example: {
        status: 200,
        message: 'If the email exists, you will receive instructions.',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid email payload.',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reset a password with a one-time token',
    description:
      'Validates the password reset token, checks expiration, updates the password, and clears the stored reset token state.',
  })
  @ApiBody({
    type: ResetPasswordDto,
    examples: {
      default: {
        summary: 'Reset password request',
        value: {
          token: '8a40fbe642ec4bb7880f1ae6df44fd5b',
          newPassword: 'NewSecurePass123',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Password updated successfully.',
    schema: {
      example: {
        status: 200,
        message: 'Password updated successfully',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid reset password payload.',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid or expired reset token.',
    schema: {
      example: {
        success: false,
        timestamp: '2026-04-09T20:12:10.000Z',
        path: '/api/auth/reset-password',
        method: 'POST',
        requestId: '1712693530000-a1b2c3',
        error: {
          code: 'RESET_PASSWORD_TOKEN_INVALID',
          message: 'RESET_PASSWORD_TOKEN_INVALID',
          details: [],
        },
      },
    },
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
