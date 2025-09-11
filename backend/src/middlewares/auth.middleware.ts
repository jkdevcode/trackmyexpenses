import type { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  user?: { id: number };
}

export function authGuard(req: AuthRequest, res: Response, next: NextFunction) {
  // Intentar obtener token del header Authorization
  let token = req.headers.authorization;
  
  // Si no está en Authorization, buscar en el header 'token'
  if (!token) {
    token = req.headers.token as string;
  } else {
    // Si está en Authorization, extraer el token después de "Bearer "
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: "Token no proporcionado. Use el header 'Authorization: Bearer <token>' o 'token: <token>'"
    });
  }

  try {
    const payload = verifyJwt<{ id: number }>(token);
    req.user = { id: payload.id };
    next();
  } catch (err: any) {
    return res.status(401).json({
      status: 401,
      message: "Token inválido o expirado"
    });
  }
}
