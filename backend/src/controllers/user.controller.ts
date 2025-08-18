import type { Response } from "express";
import { prisma } from "../prisma/prisma.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { validationResult } from "express-validator";

export async function me(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, tipoDocumento: true, documento: true, nombres: true,
        apellidos: true, correo: true, foto: true, fechaIngreso: true, fechaUltimaEdicion: true
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Usuario no encontrado"
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Perfil obtenido exitosamente",
      user
    });
  } catch (err: any) {
    console.error("Error obteniendo perfil:", err);
    return res.status(500).json({
      status: 500,
      message: "Error en el servidor " + err.message
    });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
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

    const { nombres, apellidos, correo, foto } = req.body;

    const updated = await prisma.usuario.update({
      where: { id: req.user!.id },
      data: {
        ...(nombres && { nombres }),
        ...(apellidos && { apellidos }),
        ...(correo && { correo }),
        ...(foto && { foto }),
        fechaUltimaEdicion: new Date(),
      },
      select: {
        id: true, documento: true, nombres: true, apellidos: true, correo: true, foto: true, fechaUltimaEdicion: true
      }
    });

    return res.status(200).json({
      status: 200,
      message: "Perfil actualizado exitosamente",
      user: updated
    });
  } catch (e: any) {
    if (e.code === "P2002") {
      return res.status(409).json({
        status: 409,
        message: "Correo ya está en uso"
      });
    }
    console.error("Error actualizando perfil:", e);
    return res.status(500).json({
      status: 500,
      message: "Error en el servidor " + e.message
    });
  }
}
