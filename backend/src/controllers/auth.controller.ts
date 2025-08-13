import type { Request, Response, NextFunction } from "express";
const { AuthService } = require("../services/auth.service");
const { loginSchema, registerSchema } = require("../validations/auth.schema");

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const user = await AuthService.register(parsed);
    res.status(201).json({ message: "Usuario creado", user });
  } catch (err) { next(err); }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const data = await AuthService.login(parsed);
    res.json(data);
  } catch (err) { next(err); }
};

module.exports = { register, login };
