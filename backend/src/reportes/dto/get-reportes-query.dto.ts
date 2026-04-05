import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const getReportesQuerySchema = z.object({
  // New filtering system
  period: z.enum(['week', 'month', 'year', 'all', 'custom']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),

  // Legacy filtering system (backward compatibility)
  from: z
    .string()
    .regex(dateRegex, 'from debe tener formato YYYY-MM-DD')
    .optional(),
  to: z
    .string()
    .regex(dateRegex, 'to debe tener formato YYYY-MM-DD')
    .optional(),
});

export class GetReportesQueryDto extends createZodDto(getReportesQuerySchema) {}
