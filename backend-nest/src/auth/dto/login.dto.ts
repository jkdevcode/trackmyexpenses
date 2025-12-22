import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const loginUserSchema = z.object({
  documento: z.string().min(6).max(10, { message: 'El documento es obligatorio' }),
  contrasena: z.string().min(5, { message: 'La contraseña es obligatoria' }),
}).strict();

export class LoginUserDto extends createZodDto(loginUserSchema) {}
