import { check } from "express-validator";

// validacion de actualización de perfil
export const validateUpdateProfile = [
  check("nombres", "Los nombres deben tener al menos 2 caracteres")
    .optional()
    .isLength({ min: 2 }),
  
  check("apellidos", "Los apellidos deben tener al menos 2 caracteres")
    .optional()
    .isLength({ min: 2 }),
  
  check("correo", "El correo electrónico debe ser válido")
    .optional()
    .isEmail(),
  
  check("foto", "La foto debe ser una URL válida")
    .optional()
    .isURL()
];
