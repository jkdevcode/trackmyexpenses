import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Logger } from 'nestjs-pino';
import { Request, Response } from 'express';
import { RequestContext } from '../context/request-context';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest<Request & { id?: string }>();
    const response = http.getResponse<Response>();

    return RequestContext.run(request.id ?? null, () =>
      next.handle().pipe(
        finalize(() => {
          this.logger.log({
            msg: 'HTTP request completed',
            method: request.method,
            path: request.originalUrl,
            statusCode: response.statusCode,
            durationMs: Date.now() - now,
            requestId: request.id ?? null,
            userAgent: request.headers['user-agent'],
            ip: request.ip,
          });
        }),
      ),
    );
  }
}
