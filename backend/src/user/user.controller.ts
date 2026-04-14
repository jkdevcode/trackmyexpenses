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

import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCookieAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
    rol: AppRole;
  };
}
@ApiTags('Users')
@ApiCookieAuth('token')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(AppRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'List all users' })
  @ApiOkResponse({ description: 'List of all users retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid auth cookie.' })
  async findAll() {
    return this.userService.getAllUsers();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({
    description: 'Current user profile retrieved successfully.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid auth cookie.' })
  async me(@Request() req: RequestWithUser) {
    return this.userService.me(req.user.id);
  }

  @Get(':id')
  @UseGuards(SelfOrAdminGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiOkResponse({ description: 'User retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid auth cookie.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiOkResponse({ description: 'Password changed successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid password data.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid auth cookie.' })
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
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiOkResponse({ description: 'User profile updated successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid profile data.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid auth cookie.' })
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
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiOkResponse({ description: 'User deleted successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid auth cookie.' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
