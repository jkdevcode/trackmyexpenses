import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const getFacturasQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).optional().default('month'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export class GetFacturasQueryDto extends createZodDto(getFacturasQuerySchema) {}
