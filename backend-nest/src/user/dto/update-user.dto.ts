import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateUserSchema = z.object({
  nombres: z.string().min(2, { message: 'Los nombres deben tener al menos 2 caracteres' }).optional(),
  apellidos: z.string().min(2, { message: 'Los apellidos deben tener al menos 2 caracteres' }).optional(),
  correo: z.string().email({ message: 'El correo electrónico debe ser válido' }).optional(),
  foto: z.string().url({ message: 'La foto debe ser una URL válida' }).optional().or(z.literal('')),
});

export class UpdateUserDto extends createZodDto(updateUserSchema) {}
