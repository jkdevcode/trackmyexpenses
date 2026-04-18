import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'La contraseña actual es requerida')
      .describe('Current user password'),
    newPassword: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
      .describe('New password (min 8 chars)'),
    confirmPassword: z
      .string()
      .min(8, 'La confirmación debe tener al menos 8 caracteres')
      .describe('Confirmation of the new password'),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}
