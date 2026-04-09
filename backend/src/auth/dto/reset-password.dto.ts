import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(32, 'Token invalido'),
    newPassword: z
      .string()
      .min(8, 'La nueva contrasena debe tener al menos 8 caracteres'),
  })
  .strict();

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {}
