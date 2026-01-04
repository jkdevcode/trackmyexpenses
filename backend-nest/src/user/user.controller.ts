import { Controller, Get, Patch, Delete, UseGuards, Request, Body, Param, ParseIntPipe, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  async findAll() {
    return this.userService.getAllUsers();
  }

  @Get('me')
  async me(@Request() req: any) {
    return this.userService.me(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(ZodValidationPipe)
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto, @Request() req: any) {
    return this.userService.updateProfile(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.userService.deleteUser(id, req.user.id);
  }
}
