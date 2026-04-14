import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createProductoSchema = z.object({
  codigo: z
    .string()
    .min(1, { message: 'El código es obligatorio' })
    .describe('Product code (SKU, barcode)'),
  nombre: z
    .string()
    .min(1, { message: 'El nombre es obligatorio' })
    .describe('Product name'),
  precioUnitario: z
    .number()
    .positive({ message: 'El precio debe ser positivo' })
    .describe('Unit price'),
  // categoria: z.string().optional() // Not in schema, ignoring as per typical migration rules unless user explicitly request usage
});

export class CreateProductoDto extends createZodDto(createProductoSchema) {}
