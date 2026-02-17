import {
  Controller,
  Post,
  Body,
  UsePipes,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  async login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }
}
