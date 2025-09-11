import { check } from "express-validator";

// validacion de registro de usuario
export const validateRegister = [
  check("tipoDocumento", "El tipo de documento es obligatorio")
    .notEmpty(),
  
  check("documento", "El documento es obligatorio y debe tener entre 6 y 10 caracteres")
    .notEmpty()
    .isLength({ min: 6, max: 10 }),
  
  check("nombres", "Los nombres son obligatorios y deben tener al menos 2 caracteres")
    .notEmpty()
    .isLength({ min: 2 }),
  
  check("apellidos", "Los apellidos son obligatorios y deben tener al menos 2 caracteres")
    .notEmpty()
    .isLength({ min: 2 }),
  
  check("correo", "El correo electrónico es obligatorio y debe ser válido")
    .notEmpty()
    .isEmail(),
  
  check("contrasena", "La contraseña es obligatoria y debe tener al menos 8 caracteres")
    .notEmpty()
    .isLength({ min: 8 }),
  
  check("foto", "La foto debe ser una URL válida")
    .optional()
    .isURL()
];

// validacion de login
export const validateLogin = [
  check("documento", "El documento es obligatorio")
    .notEmpty()
    .isLength({ min: 3, max: 20 }),
  
  check("contrasena", "La contraseña es obligatoria")
    .notEmpty()
    .isLength({ min: 5 })
];
