import {
  Controller,
  Post,
  Body,
  UsePipes,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { parseJwtExpiryToMs } from './utils/parse-jwt-expiry.util';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('foto'))
  async register(
    @Body() dto: RegisterUserDto,
    @UploadedFile() foto?: Express.Multer.File,
  ) {
    return this.authService.register(dto, foto?.buffer, foto?.originalname);
  }

  @Post('login')
  @UsePipes(ZodValidationPipe)
  async login(@Body() dto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    const { token, response } = await this.authService.login(dto);
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: parseJwtExpiryToMs(expiresIn),
    });

    return response;
  }
}
