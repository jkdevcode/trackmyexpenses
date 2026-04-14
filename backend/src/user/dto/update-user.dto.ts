import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateUserSchema = z
  .object({
    nombres: z
      .string()
      .min(2, { message: 'Los nombres deben tener al menos 2 caracteres' })
      .optional()
      .describe('First names'),
    apellidos: z
      .string()
      .min(2, { message: 'Los apellidos deben tener al menos 2 caracteres' })
      .optional()
      .describe('Last names'),
    correo: z
      .string()
      .email({ message: 'El correo electrónico debe ser válido' })
      .optional()
      .describe('Email address'),
    documento: z
      .string()
      .min(5, { message: 'El documento debe tener al menos 5 caracteres' })
      .optional()
      .describe('Identity document number'),
    monedaBase: z
      .string()
      .trim()
      .length(3, { message: 'monedaBase debe tener 3 letras' })
      .optional()
      .describe('Base currency of the user, e.g. USD, EUR, COP'),
    foto: z
      .string()
      .url({ message: 'La foto debe ser una URL válida' })
      .optional()
      .or(z.literal(''))
      .describe('Profile photo URL'),
  })
  .strict();

export class UpdateUserDto extends createZodDto(updateUserSchema) {}
