const { prisma } = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const AuthService = {
  async register(data: {
    tipoDocumento: string; documento: string; nombres: string; apellidos: string;
    correo: string; contrasena: string; foto?: string;
  }) {
    const exists = await prisma.usuario.findUnique({ where: { correo: data.correo } });
    if (exists) throw { status: 409, message: "Correo ya registrado" };

    const hash = await bcrypt.hash(data.contrasena, SALT_ROUNDS);

    const user = await prisma.usuario.create({
      data: {
        tipoDocumento: data.tipoDocumento,
        documento: data.documento,
        nombres: data.nombres,
        apellidos: data.apellidos,
        correo: data.correo,
        contrasena: hash,
        foto: data.foto ?? null,
        fechaIngreso: new Date()
      }
    });

    return { id: user.id, correo: user.correo, nombres: user.nombres, apellidos: user.apellidos };
  },

  async login(data: { correo: string; contrasena: string; }) {
    const user = await prisma.usuario.findUnique({ where: { correo: data.correo } });
    if (!user) throw { status: 401, message: "Credenciales inválidas" };

    const ok = await bcrypt.compare(data.contrasena, user.contrasena);
    if (!ok) throw { status: 401, message: "Credenciales inválidas" };

    const token = jwt.sign(
      { id: user.id, correo: user.correo, rol: "USER" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: { id: user.id, correo: user.correo, nombres: user.nombres, apellidos: user.apellidos }
    };
  }
};

module.exports = { AuthService };