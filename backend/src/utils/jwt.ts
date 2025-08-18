import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function signJwt(payload: object): string {
  return (jwt as any).sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyJwt<T = any>(token: string): T {
  return (jwt as any).verify(token, JWT_SECRET) as T;
}
