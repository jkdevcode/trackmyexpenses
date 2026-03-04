import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AppRole } from '../roles.enum';
import { UnauthorizedActionError } from '../../user/errors/unauthorized-action.error';

type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    rol: AppRole;
  };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userRole = request.user?.rol;

    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new UnauthorizedActionError('No tienes permisos para este recurso');
    }

    return true;
  }
}
