import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const forgotPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Email invalido')
      .describe('Email address associated with the account'),
  })
  .strict();

export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) {}
