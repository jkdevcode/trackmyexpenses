import { AppError } from '../../common/errors/app.error';

export class ResetPasswordTokenInvalidError extends AppError {
  constructor() {
    super('RESET_PASSWORD_TOKEN_INVALID', 'RESET_PASSWORD_TOKEN_INVALID');
  }
}
