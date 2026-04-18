import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const loginUserSchema = z
  .object({
    documento: z
      .string()
      .min(6)
      .max(10, { message: 'El documento es obligatorio' })
      .describe('Document number used to identify the account'),
    contrasena: z
      .string()
      .min(5, { message: 'La contraseña es obligatoria' })
      .describe('Account password'),
  })
  .strict();

export class LoginUserDto extends createZodDto(loginUserSchema) {}
