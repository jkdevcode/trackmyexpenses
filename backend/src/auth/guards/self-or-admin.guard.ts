import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { AppRole } from '../roles.enum';

type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    rol: AppRole;
  };
  params: {
    id?: string;
  };
};

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const currentUserId = request.user?.id;
    const currentUserRole = request.user?.rol;
    const paramId = Number(request.params.id);

    if (!currentUserId || Number.isNaN(paramId)) {
      throw new ForbiddenException('No autorizado para esta accion');
    }

    const isSelf = currentUserId === paramId;
    const isAdmin = currentUserRole === AppRole.ADMIN;

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('No autorizado para editar este usuario');
    }

    return true;
  }
}
