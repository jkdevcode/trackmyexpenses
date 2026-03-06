import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { lastValueFrom } from 'rxjs';
import { Logger } from 'nestjs-pino';
import { RequestLoggingInterceptor } from './request-logging.interceptor';

describe('RequestLoggingInterceptor', () => {
  let interceptor: RequestLoggingInterceptor;
  let logger: { log: jest.Mock };

  beforeEach(async () => {
    logger = { log: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestLoggingInterceptor,
        { provide: Logger, useValue: logger },
      ],
    }).compile();

    interceptor = module.get<RequestLoggingInterceptor>(
      RequestLoggingInterceptor,
    );
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should pass through response and log request completion', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          originalUrl: '/health',
          id: 'req-123',
          headers: { 'user-agent': 'jest' },
          ip: '127.0.0.1',
        }),
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = {
      handle: () => of({ ok: true }),
    };

    const result = await lastValueFrom(interceptor.intercept(context, next));

    expect(result).toEqual({ ok: true });
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'HTTP request completed',
        method: 'GET',
        path: '/health',
        statusCode: 200,
        requestId: 'req-123',
      }),
    );
  });
});
