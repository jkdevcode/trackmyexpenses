import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

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
export class GlobalExceptionFilter implements ExceptionFilter {
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
    }

    const body: ErrorResponseBody = {
      success: false,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      method: request.method,
      requestId: request.id ?? null,
      error: {
        code,
        message,
      },
    };

    response.status(status).json(body);
  }

  private mapStatusToCode(status: number): string {
    if (status === HttpStatus.TOO_MANY_REQUESTS) {
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
