import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const productSuggestionSchema = z.object({
  nombre: z.string(),
  cantidad: z.number(),
  precioUnitario: z.number(),
  total: z.number(),
  productId: z.number().optional(), // Existing ID if matched
  newProduct: z.boolean(), // True if no match > 80%
  matchScore: z.number().optional() // Debug info
});

const scanResponseSchema = z.object({
  rawText: z.string(),
  fecha: z.string().optional(), // ISO date or raw string? Prompt will ask for ISO
  lugarCompra: z.string().optional(),
  nitProveedor: z.string().optional(),
  total: z.number().optional(),
  productos: z.array(productSuggestionSchema)
});

export class ScanResponseDto extends createZodDto(scanResponseSchema) {}
export class ProductSuggestionDto extends createZodDto(productSuggestionSchema) {}
