import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const getReportesQuerySchema = z.object({
  from: z.string().regex(dateRegex, 'from debe tener formato YYYY-MM-DD'),
  to: z.string().regex(dateRegex, 'to debe tener formato YYYY-MM-DD'),
});

export class GetReportesQueryDto extends createZodDto(getReportesQuerySchema) {}
