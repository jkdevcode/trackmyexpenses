import type { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");

export interface AuthRequest extends Request {
  user?: { id: number; correo: string; rol: string };
}

const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization; // 'Bearer token'
    if (!header) return res.status(401).json({ error: "No token provided" });
    const token = header.split(" ")[1];
    const secret = process.env.JWT_SECRET as string;
    const payload = jwt.verify(token, secret) as AuthRequest["user"];
    if (!payload) return res.status(401).json({ error: "Invalid token" });
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { auth };
