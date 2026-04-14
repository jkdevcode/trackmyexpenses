import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { isValidFacturaCantidad } from '../factura.domain';

const facturaItemSchema = z
  .object({
    productoId: z
      .number()
      .int({ message: 'productoId debe ser un entero' })
      .positive({ message: 'productoId debe ser mayor a 0' })
      .describe('ID of the product (obtained from the products catalogue)'),
    cantidad: z
      .number()
      .positive({ message: 'cantidad debe ser mayor a 0' })
      .describe('Quantity of the item purchased'),
    unidad: z
      .enum(['u', 'kg', 'g'])
      .optional()
      .default('u')
      .describe('Unit of measurement (u=units, kg=kilograms, g=grams)'),
    descuento: z
      .number()
      .min(0, { message: 'descuento no puede ser negativo' })
      .max(100, { message: 'descuento no puede ser mayor a 100' })
      .optional()
      .describe('Discount applied to this item percentage-wise (0-100)'),
  })
  .superRefine((item, ctx) => {
    if (!isValidFacturaCantidad(item.cantidad, item.unidad)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cantidad'],
        message:
          'cantidad debe ser un entero positivo, excepto cuando la unidad es kg',
      });
    }
  });

const createFacturaSchema = z.object({
  metodoPago: z
    .enum([
      'EFECTIVO',
      'TARJETA_CREDITO',
      'TARJETA_DEBITO',
      'TRANSFERENCIA',
      'OTRO',
    ])
    .describe('Payment method used'),
  moneda: z
    .string()
    .trim()
    .length(3, { message: 'moneda debe tener 3 letras' })
    .optional()
    .describe('Currency code (e.g. COP, USD, EUR)'),
  tasaCambio: z.coerce
    .number()
    .positive({ message: 'tasaCambio debe ser mayor a 0' })
    .optional()
    .describe('Exchange rate if currency differs from base'),
  lugarCompra: z.string().min(1).describe('Store or place of purchase'),
  nitProveedor: z.string().optional().describe('Supplier tax ID or NIT'),
  fechaHoraCompra: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'La fecha debe ser valida (ISO 8601)',
    })
    .optional()
    .describe('Date and time of purchase (ISO 8601)'),
  items: z
    .array(facturaItemSchema)
    .min(1, { message: 'Debe haber al menos un item' })
    .describe('List of items purchased'),
  imagenUrl: z
    .string()
    .optional()
    .describe('URL to receipt image if uploaded separately'),
  ocrSource: z
    .enum(['ai', 'ai-image', 'ocr', 'fallback'])
    .optional()
    .describe('Source of the OCR data if applicable'),
});

export class CreateFacturaDto extends createZodDto(createFacturaSchema) {}
