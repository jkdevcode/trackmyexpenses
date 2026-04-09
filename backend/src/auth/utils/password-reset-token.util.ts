import { createHash, randomBytes } from 'crypto';

export const PASSWORD_RESET_TOKEN_TTL_MINUTES = 30;
const PASSWORD_RESET_TOKEN_SIZE_BYTES = 32;

export const hashPasswordResetToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export const createPasswordResetToken = (
  ttlMinutes = PASSWORD_RESET_TOKEN_TTL_MINUTES,
) => {
  const rawToken = randomBytes(PASSWORD_RESET_TOKEN_SIZE_BYTES).toString('hex');

  return {
    rawToken,
    hashedToken: hashPasswordResetToken(rawToken),
    expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
  };
};
