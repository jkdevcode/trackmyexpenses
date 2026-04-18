import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const registerUserSchema = z
  .object({
    tipoDocumento: z
      .string()
      .min(1, 'Obligatorio')
      .describe('Type of identity document (e.g., CC, CE, Passport)'),
    documento: z
      .string()
      .min(6)
      .max(10, 'Entre 6 y 10 caracteres')
      .describe('Identity document number'),
    nombres: z.string().min(2, 'Mínimo 2 caracteres').describe('First names'),
    apellidos: z.string().min(2, 'Mínimo 2 caracteres').describe('Last names'),
    correo: z.string().email('Email inválido').describe('Email address'),
    contrasena: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .describe('Account password'),
    monedaBase: z
      .string()
      .trim()
      .length(3, { message: 'monedaBase debe tener 3 letras' })
      .optional()
      .describe('Base currency of the user account (e.g., COP, USD)'),
    // .or(z.literal('')) es útil para campos opcionales en formularios
    // Foto is handled by FileInterceptor, not Zod Body validation
  })
  .strict();

// Remove spaces from error messages if needed to match exact strings, but generic valid messages are fine.
export class RegisterUserDto extends createZodDto(registerUserSchema) {}
