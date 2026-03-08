import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { Logger } from 'nestjs-pino';
import { DomainConflictError } from '../errors/domain-conflict.error';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let logger: { error: jest.Mock };

  beforeEach(() => {
    logger = { error: jest.fn() };
    filter = new GlobalExceptionFilter(logger as unknown as Logger);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch DomainConflictError and return 409 response', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const request = {
      method: 'POST',
      originalUrl: '/productos',
      id: 'req-1',
    };
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(new DomainConflictError('Codigo duplicado'), host);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        path: '/productos',
        method: 'POST',
        requestId: 'req-1',
        error: {
          code: 'CONFLICT',
          message: 'Codigo duplicado',
        },
      }),
    );
    expect(logger.error).toHaveBeenCalled();
  });

  it('should catch HttpException and return mapped response', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const request = {
      method: 'PATCH',
      originalUrl: '/users/1',
      id: 'req-2',
    };
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(new BadRequestException('Invalid payload'), host);

    expect(status).toHaveBeenCalledWith(400);
    const [body] = json.mock.calls[0] as [
      {
        error: {
          code: string;
        };
      },
    ];
    expect(body.error.code).toBe('BAD_REQUEST');
  });
});
