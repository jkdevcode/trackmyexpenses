import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { Logger } from 'nestjs-pino';
import { AppError } from '../errors/app.error';
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
          details: [],
        },
      }),
    );
    expect(logger.error).toHaveBeenCalled();
  });

  it('should catch AppError and return structured 422 response', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const request = {
      method: 'POST',
      originalUrl: '/facturas',
      id: 'req-3',
    };
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(
      new AppError('FACTURA_ITEM_DUPLICATE', 'FACTURA_ITEM_DUPLICATE', [
        {
          field: 'items[1]',
          code: 'FACTURA_ITEM_DUPLICATE',
          meta: { index: 1 },
        },
      ]),
      host,
    );

    expect(status).toHaveBeenCalledWith(422);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          code: 'FACTURA_ITEM_DUPLICATE',
          message: 'FACTURA_ITEM_DUPLICATE',
          details: [
            expect.objectContaining({
              field: 'items[1]',
              code: 'FACTURA_ITEM_DUPLICATE',
            }),
          ],
        },
      }),
    );
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
          details: unknown[];
        };
      },
    ];
    expect(body.error.code).toBe('BAD_REQUEST');
    expect(body.error.details).toEqual([]);
  });
});
