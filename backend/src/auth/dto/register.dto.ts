import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const registerUserSchema = z
  .object({
    tipoDocumento: z.string().min(1, 'Obligatorio'),
    documento: z.string().min(6).max(10, 'Entre 6 y 10 caracteres'),
    nombres: z.string().min(2, 'Mínimo 2 caracteres'),
    apellidos: z.string().min(2, 'Mínimo 2 caracteres'),
    correo: z.string().email('Email inválido'),
    contrasena: z.string().min(8, 'Mínimo 8 caracteres'),
    // .or(z.literal('')) es útil para campos opcionales en formularios
    // Foto is handled by FileInterceptor, not Zod Body validation
  })
  .strict();

// Remove spaces from error messages if needed to match exact strings, but generic valid messages are fine.
export class RegisterUserDto extends createZodDto(registerUserSchema) {}
