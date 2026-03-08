import {
  Controller,
  Get,
  Patch,
  Delete,
  UseGuards,
  Request,
  Body,
  Param,
  ParseIntPipe,
  UsePipes,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SelfOrAdminGuard } from '../auth/guards/self-or-admin.guard';
import { AppRole } from '../auth/roles.enum';
import {
  imageFileInterceptorOptions,
  optionalImageFilePipe,
} from '../common/upload/upload-options';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
    rol: AppRole;
  };
}
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @Roles(AppRole.ADMIN)
  @UseGuards(RolesGuard)
  async findAll() {
    return this.userService.getAllUsers();
  }

  @Get('me')
  async me(@Request() req: RequestWithUser) {
    return this.userService.me(req.user.id);
  }

  @Get(':id')
  @UseGuards(SelfOrAdminGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch('change-password')
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Request() req: RequestWithUser,
  ) {
    return this.userService.changePassword(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(SelfOrAdminGuard)
  @UsePipes(ZodValidationPipe)
  @UseInterceptors(FileInterceptor('foto', imageFileInterceptorOptions))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @UploadedFile(optionalImageFilePipe) file: Express.Multer.File,
  ) {
    return this.userService.updateProfile(
      id,
      dto,
      file?.buffer,
      file?.originalname,
    );
  }

  @Delete(':id')
  @UseGuards(SelfOrAdminGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.userService.deleteUser(id, req.user.id);
  }
}
