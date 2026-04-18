import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { isValidFacturaCantidad } from '../factura.domain';

const updateFacturaItemSchema = z
  .object({
    productoId: z
      .number()
      .int({ message: 'productoId debe ser un entero' })
      .positive({ message: 'productoId debe ser mayor a 0' })
      .describe('Product ID'),
    cantidad: z
      .number()
      .positive({ message: 'cantidad debe ser mayor a 0' })
      .optional()
      .describe('Quantity'),
    unidad: z.enum(['u', 'kg', 'g']).optional().describe('Unit (u, kg, g)'),
    descuento: z
      .number()
      .min(0, { message: 'descuento no puede ser negativo' })
      .max(100, { message: 'descuento no puede ser mayor a 100' })
      .optional()
      .describe('Discount (0-100)'),
    precioUnitario: z
      .number()
      .positive({ message: 'precioUnitario debe ser mayor a 0' })
      .optional()
      .describe('Unit price'),
  })
  .superRefine((item, ctx) => {
    if (
      item.cantidad !== undefined &&
      item.unidad !== undefined &&
      !isValidFacturaCantidad(item.cantidad, item.unidad)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cantidad'],
        message:
          'cantidad debe ser un entero positivo, excepto cuando la unidad es kg',
      });
    }
  });

const updateFacturaSchema = z.object({
  metodoPago: z
    .enum([
      'EFECTIVO',
      'TARJETA_CREDITO',
      'TARJETA_DEBITO',
      'TRANSFERENCIA',
      'OTRO',
    ])
    .optional()
    .describe('Payment method'),
  lugarCompra: z.string().min(1).optional().describe('Place of purchase'),
  nitProveedor: z.string().optional().describe('Supplier NIT'),
  fechaHoraCompra: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'La fecha debe ser valida (ISO 8601)',
    })
    .optional()
    .describe('Purchase date (ISO 8601)'),
  items: z
    .array(updateFacturaItemSchema)
    .min(1)
    .optional()
    .describe('Items to update'),
});

export class UpdateFacturaDto extends createZodDto(updateFacturaSchema) {}
