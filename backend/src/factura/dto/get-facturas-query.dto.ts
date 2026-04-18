import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const getFacturasQuerySchema = z.object({
  period: z
    .enum(['week', 'month', 'year', 'all', 'custom'])
    .optional()
    .default('month')
    .describe('Filter period predefined preset'),
  startDate: z
    .string()
    .optional()
    .describe('Start date for custom period (YYYY-MM-DD)'),
  endDate: z
    .string()
    .optional()
    .describe('End date for custom period (YYYY-MM-DD)'),
  page: z.coerce
    .number()
    .int()
    .min(1)
    .optional()
    .default(1)
    .describe('Page number'),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe('Items per page limit'),
});

export class GetFacturasQueryDto extends createZodDto(getFacturasQuerySchema) {}
