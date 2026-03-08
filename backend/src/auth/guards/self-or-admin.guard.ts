import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AppRole } from '../roles.enum';
import { UnauthorizedActionError } from '../../user/errors/unauthorized-action.error';

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
      throw new UnauthorizedActionError('No autorizado para esta accion');
    }

    const isSelf = currentUserId === paramId;
    const isAdmin = currentUserRole === AppRole.ADMIN;

    if (!isSelf && !isAdmin) {
      throw new UnauthorizedActionError(
        'No autorizado para acceder a este recurso',
      );
    }

    return true;
  }
}
