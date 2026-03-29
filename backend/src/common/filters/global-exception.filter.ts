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
import { InvalidCredentialsError } from '../../auth/errors/invalid-credentials.error';
import { ProductoNotFoundError } from '../../producto/errors/producto-not-found.error';
import { UnauthorizedActionError } from '../../user/errors/unauthorized-action.error';
import { UserNotFoundError } from '../../user/errors/user-not-found.error';
import { RequestContext } from '../context/request-context';
import { AppError, type AppErrorDetail } from '../errors/app.error';
import { DomainConflictError } from '../errors/domain-conflict.error';
import { DomainForbiddenError } from '../errors/domain-forbidden.error';

type ErrorResponseBody = {
  success: false;
  timestamp: string;
  path: string;
  method: string;
  requestId: string | null;
  error: {
    code: string;
    message: string | string[];
    details: AppErrorDetail[];
  };
};

type StructuredHttpErrorBody = {
  code?: string;
  message?: string | string[];
  details?: AppErrorDetail[];
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
    let details: AppErrorDetail[] = [];

    if (exception instanceof AppError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      code = exception.code;
      message = exception.message;
      details = this.normalizeDetails(exception.details);
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        code = this.mapStatusToCode(status);
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const res = exceptionResponse as {
          code?: string;
          details?: AppErrorDetail[];
          message?: string | string[];
          error?: string | StructuredHttpErrorBody;
        };
        const structuredError =
          typeof res.error === 'object' && res.error !== null
            ? res.error
            : null;

        code =
          structuredError?.code ?? res.code ?? this.mapStatusToCode(status);
        details = this.normalizeDetails(
          structuredError?.details ?? res.details,
        );
        message =
          structuredError?.message ??
          res.message ??
          (typeof res.error === 'string' ? res.error : undefined) ??
          exception.message;
      } else {
        code = this.mapStatusToCode(status);
        message = exception.message;
      }
    } else if (exception instanceof UserNotFoundError) {
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
        details,
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

  private normalizeDetails(details: unknown): AppErrorDetail[] {
    if (!Array.isArray(details)) {
      return [];
    }

    return details.flatMap((detail) => {
      if (
        typeof detail !== 'object' ||
        detail === null ||
        typeof (detail as AppErrorDetail).code !== 'string'
      ) {
        return [];
      }

      const normalizedDetail: AppErrorDetail = {
        code: (detail as AppErrorDetail).code,
      };

      if (typeof (detail as AppErrorDetail).field === 'string') {
        normalizedDetail.field = (detail as AppErrorDetail).field;
      }

      if (
        (detail as AppErrorDetail).meta &&
        typeof (detail as AppErrorDetail).meta === 'object'
      ) {
        normalizedDetail.meta = (detail as AppErrorDetail).meta;
      }

      return [normalizedDetail];
    });
  }
}
