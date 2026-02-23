import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z
      .string()
      .min(8, 'La confirmación debe tener al menos 8 caracteres'),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}
