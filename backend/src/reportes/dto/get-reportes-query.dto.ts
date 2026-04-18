import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const getReportesQuerySchema = z.object({
  // New filtering system
  period: z
    .enum(['week', 'month', 'year', 'all', 'custom'])
    .optional()
    .describe('Filter period predefined preset'),
  startDate: z
    .string()
    .optional()
    .describe('Start date for custom period (YYYY-MM-DD)'),
  endDate: z
    .string()
    .optional()
    .describe('End date for custom period (YYYY-MM-DD)'),

  // Legacy filtering system (backward compatibility)
  from: z
    .string()
    .regex(dateRegex, 'from debe tener formato YYYY-MM-DD')
    .optional()
    .describe('Legacy start date'),
  to: z
    .string()
    .regex(dateRegex, 'to debe tener formato YYYY-MM-DD')
    .optional()
    .describe('Legacy end date'),
});

export class GetReportesQueryDto extends createZodDto(getReportesQuerySchema) {}
