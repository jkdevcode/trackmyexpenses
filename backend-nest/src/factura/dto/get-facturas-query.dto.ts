import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const getFacturasQuerySchema = z.object({
    period: z.enum(['day', 'week', 'month', 'year']).optional().default('month'),
});

export class GetFacturasQueryDto extends createZodDto(getFacturasQuerySchema) { }
