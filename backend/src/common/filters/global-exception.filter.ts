import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';
import { RequestContext } from '../context/request-context';
import { UserNotFoundError } from '../../user/errors/user-not-found.error';
import { UnauthorizedActionError } from '../../user/errors/unauthorized-action.error';
import { FacturaNotFoundError } from '../../factura/errors/factura-not-found.error';
import { DomainConflictError } from '../errors/domain-conflict.error';
import { DomainForbiddenError } from '../errors/domain-forbidden.error';
import { InvalidCredentialsError } from '../../auth/errors/invalid-credentials.error';
import { ProductoNotFoundError } from '../../producto/errors/producto-not-found.error';

type ErrorResponseBody = {
  success: false;
  timestamp: string;
  path: string;
  method: string;
  requestId: string | null;
  error: {
    code: string;
    message: string | string[];
  };
};

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      code = this.mapStatusToCode(status);

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const res = exceptionResponse as {
          message?: string | string[];
          error?: string;
        };
        message = res.message ?? res.error ?? exception.message;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof UserNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      code = this.mapStatusToCode(status);
      message = exception.message;
    } else if (exception instanceof FacturaNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      code = this.mapStatusToCode(status);
      message = exception.message;
    } else if (exception instanceof ProductoNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      code = this.mapStatusToCode(status);
      message = exception.message;
    } else if (exception instanceof UnauthorizedActionError) {
      status = HttpStatus.FORBIDDEN;
      code = this.mapStatusToCode(status);
      message = exception.message;
    } else if (exception instanceof DomainForbiddenError) {
      status = HttpStatus.FORBIDDEN;
      code = this.mapStatusToCode(status);
      message = exception.message;
    } else if (exception instanceof InvalidCredentialsError) {
      status = HttpStatus.UNAUTHORIZED;
      code = this.mapStatusToCode(status);
      message = exception.message;
    } else if (exception instanceof DomainConflictError) {
      status = HttpStatus.CONFLICT;
      code = this.mapStatusToCode(status);
      message = exception.message;
    }

    const requestId = request.id ?? RequestContext.getRequestId();

    const body: ErrorResponseBody = {
      success: false,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      method: request.method,
      requestId,
      error: {
        code,
        message,
      },
    };

    this.logger.error({
      msg: 'Unhandled request exception',
      requestId,
      method: request.method,
      path: request.originalUrl,
      status,
      error: exception instanceof Error ? exception.message : exception,
    });

    response.status(status).json(body);
  }

  private mapStatusToCode(status: number): string {
    if (status === Number(HttpStatus.TOO_MANY_REQUESTS)) {
      return 'RATE_LIMIT_EXCEEDED';
    }

    const statusMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
    };

    return statusMap[status] ?? 'HTTP_ERROR';
  }
}
