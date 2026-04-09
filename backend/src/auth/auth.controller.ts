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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('foto', imageFileInterceptorOptions))
  async register(
    @Body() dto: RegisterUserDto,
    @UploadedFile(optionalImageFilePipe) foto?: Express.Multer.File,
  ) {
    return this.authService.register(dto, foto?.buffer, foto?.originalname);
  }

  @Post('login')
  @UsePipes(ZodValidationPipe)
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
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
