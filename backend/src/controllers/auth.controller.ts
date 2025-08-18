import type { Request, Response } from "express";
import { prisma } from "../prisma/prisma.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signJwt } from "../utils/jwt.js";
import { validationResult } from "express-validator";

export async function register(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 400,
        message: "Datos inválidos",
        details: errors.array().map((e: any) => ({
          field: e.path,
          message: e.msg,
        })),
      });
    }

    const {
      tipoDocumento,
      documento,
      nombres,
      apellidos,
      correo,
      contrasena,
      foto,
    } = req.body;

    // ¿existe correo o documento?
    const exists = await prisma.usuario.findFirst({
      where: {
        OR: [{ correo }, { documento }],
      },
    });
    if (exists) {
      return res.status(409).json({
        status: 409,
        message: "Correo o documento ya registrados",
      });
    }

    const hashed = await hashPassword(contrasena);

    const nuevo = await prisma.usuario.create({
      data: {
        tipoDocumento,
        documento,
        nombres,
        apellidos,
        correo,
        contrasena: hashed,
        foto: foto || null,
        fechaIngreso: new Date(),
      },
    });

    if (nuevo.id) {
      return res.status(200).json({
        status: 200,
        message: "Se registró con éxito el usuario " + nombres + " " + apellidos,
      });
    } else {
      return res.status(403).json({
        status: 403,
        message: "No se registró el usuario",
      });
    }
  } catch (err: any) {
    console.error("Error en registro:", err);
    return res.status(500).json({
      status: 500,
      message: "Error en el servidor " + err.message,
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 400,
        message: "Datos inválidos",
        details: errors.array().map((e: any) => ({
          field: e.path,
          message: e.msg,
        })),
      });
    }

    const { documento, contrasena } = req.body;

    const user = await prisma.usuario.findUnique({ where: { documento } });
    if (!user) return res.status(401).json({
      status: 401,
      message: "Credenciales inválidas"
    });

    const ok = await comparePassword(contrasena, user.contrasena);
    if (!ok) return res.status(401).json({
      status: 401,
      message: "Credenciales inválidas"
    });

    const token = signJwt({ id: user.id });

    return res.status(200).json({
      status: 200,
      message: "Login exitoso",
      user: {
        id: user.id,
        documento: user.documento,
        nombres: user.nombres,
        apellidos: user.apellidos,
        correo: user.correo,
        foto: user.foto,
        fechaIngreso: user.fechaIngreso,
      },
      token,
    });
  } catch (err: any) {
    console.error("Error en login:", err);
    return res.status(500).json({
      status: 500,
      message: "Error en el servidor " + err.message,
    });
  }
}
