import { AppError, type AppErrorDetail } from '../../common/errors/app.error';
import { FACTURA_ERROR_CODES } from './factura-error-codes';

export class FacturaNotFoundError extends AppError {
  constructor(details?: AppErrorDetail[]) {
    super(FACTURA_ERROR_CODES.NOT_FOUND, 'Factura not found', details);
    this.name = 'FacturaNotFoundError';
  }
}
