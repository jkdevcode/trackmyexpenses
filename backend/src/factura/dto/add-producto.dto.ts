import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { isValidFacturaCantidad } from '../factura.domain';

const addProductoToFacturaSchema = z
  .object({
    productoId: z
      .number()
      .int()
      .positive({ message: 'ID de producto invalido' })
      .describe('ID of the product being added'),
    cantidad: z
      .number()
      .positive({ message: 'La cantidad debe ser mayor a 0' })
      .describe('Quantity added'),
    unidad: z
      .enum(['u', 'kg', 'g'])
      .optional()
      .default('u')
      .describe('Unit of measurement'),
    descuento: z
      .number()
      .min(0)
      .max(100)
      .optional()
      .default(0)
      .describe('Discount applied percentage-wise (0-100)'),
    precioUnitario: z
      .number()
      .positive({ message: 'precioUnitario debe ser mayor a 0' })
      .optional()
      .describe('Unit price'),
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

export class AddProductoFacturaDto extends createZodDto(
  addProductoToFacturaSchema,
) {}
