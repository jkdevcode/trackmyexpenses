import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const productoOcrSchema = z.object({
  nombreDetectado: z.string().min(1).describe('Extracted OCR item name'),
  precioUnitario: z.coerce
    .number()
    .positive()
    .describe('Extracted OCR unit price'),
  cantidadDetectada: z.coerce
    .number()
    .positive()
    .default(1)
    .describe('Extracted OCR quantity'),
  unidadDetectada: z
    .string()
    .optional()
    .default('u')
    .describe('Extracted OCR unit of measurement'),
  descuentoDetectado: z.coerce
    .number()
    .min(0)
    .max(100)
    .optional()
    .default(0)
    .describe('Extracted OCR discount (0-100)'),
});

export const createOcrFacturaSchema = z.object({
  metodoPago: z
    .enum([
      'EFECTIVO',
      'TARJETA_CREDITO',
      'TARJETA_DEBITO',
      'TRANSFERENCIA',
      'OTRO',
    ])
    .default('EFECTIVO')
    .describe('Confirmed payment method'),
  moneda: z
    .string()
    .trim()
    .length(3, { message: 'moneda debe tener 3 letras' })
    .optional()
    .describe('Confirmed currency code'),
  tasaCambio: z.coerce
    .number()
    .positive({ message: 'tasaCambio debe ser mayor a 0' })
    .optional()
    .describe('Confirmed exchange rate'),
  lugarCompra: z
    .string()
    .min(1)
    .describe('Confirmed store or place of purchase'),
  nitProveedor: z
    .string()
    .optional()
    .describe('Confirmed supplier tax ID or NIT'),
  fechaHoraCompra: z
    .string()
    .datetime({ message: 'Fecha invalida (ISO)' })
    .describe('Confirmed date and time of purchase'),
  totalPagar: z.coerce
    .number()
    .optional()
    .describe('Confirmed total amount paid'),
  ocrSource: z
    .enum(['ai', 'ai-image', 'ocr', 'fallback'])
    .describe('Source engine from OCR process'),
  items: z.array(productoOcrSchema).describe('Confirmed list of items'),
});

export class CreateOcrFacturaDto extends createZodDto(createOcrFacturaSchema) {}
