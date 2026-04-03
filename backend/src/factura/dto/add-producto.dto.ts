import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { isValidFacturaCantidad } from '../factura.domain';

const addProductoToFacturaSchema = z
  .object({
    productoId: z
      .number()
      .int()
      .positive({ message: 'ID de producto invalido' }),
    cantidad: z
      .number()
      .positive({ message: 'La cantidad debe ser mayor a 0' }),
    unidad: z.enum(['u', 'kg', 'g']).optional().default('u'),
    descuento: z.number().min(0).max(100).optional().default(0),
    precioUnitario: z
      .number()
      .positive({ message: 'precioUnitario debe ser mayor a 0' })
      .optional(),
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
