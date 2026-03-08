import type { CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'token';

export function buildAuthCookieOptions(
  maxAge: number | undefined,
  isProduction: boolean,
): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge,
  };
}
