import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const forgotPasswordSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Email invalido'),
  })
  .strict();

export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) {}
