import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../infra/storage/storage.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SelfOrAdminGuard } from '../auth/guards/self-or-admin.guard';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [UserController],
  providers: [UserService, RolesGuard, SelfOrAdminGuard],
  exports: [UserService],
})
export class UserModule {}
