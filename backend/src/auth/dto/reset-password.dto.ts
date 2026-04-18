import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .trim()
      .min(32, 'Token invalido')
      .describe('One-time password reset token received by email'),
    newPassword: z
      .string()
      .min(8, 'La nueva contrasena debe tener al menos 8 caracteres')
      .describe('New password for the account'),
  })
  .strict();

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {}
