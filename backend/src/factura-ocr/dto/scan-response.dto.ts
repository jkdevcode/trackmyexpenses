import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const confidenceSchema = z.object({
  nombre: z.number().nullable(),
  cantidad: z.number().nullable(),
  precio: z.number().nullable(),
});

const productSuggestionSchema = z.object({
  nombreDetected: z.string(),
  cantidad: z.number().default(1),
  unidad: z.enum(['u', 'kg', 'g']).default('u'),
  precioUnitario: z.number().int(), // Integer COP
  precioTotal: z.number().int(), // Integer COP
  productId: z.number().optional(),
  matchedBy: z.string().nullable().optional(), // 'barcode', 'fuzzy', 'fallback-regex', null
  matchScore: z.number().nullable().optional(),
  confidence: confidenceSchema,
});

const parsedSchema = z.object({
  empresa: z
    .object({
      nombre: z.string().optional(),
      nit: z.string().optional(),
    })
    .optional(),
  fecha: z.string().nullable().optional(), // YYYY-MM-DD
  productos: z.array(productSuggestionSchema),
  totalDetectado: z.number().nullable().optional(),
  notes: z.array(z.string()).optional(),
});

const scanResponseSchema = z.object({
  rawText: z.string(),
  parsed: parsedSchema,
  imageRef: z.string().optional(),
  usedFallbackParser: z.boolean(),
});

export class ScanResponseDto extends createZodDto(scanResponseSchema) {}
export class ProductSuggestionDto extends createZodDto(
  productSuggestionSchema,
) {}
