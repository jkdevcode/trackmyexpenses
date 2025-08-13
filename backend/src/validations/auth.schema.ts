const { z } = require("zod");

const registerSchema = z.object({
  tipoDocumento: z.enum(["CC","CE","PASAPORTE"]),
  documento: z.string().min(4),
  nombres: z.string().min(2),
  apellidos: z.string().min(2),
  correo: z.string().email(),
  contrasena: z.string().min(6),
  foto: z.string().url().optional()
});

const loginSchema = z.object({
  correo: z.string().email(),
  contrasena: z.string().min(6)
});

module.exports = { registerSchema, loginSchema };
