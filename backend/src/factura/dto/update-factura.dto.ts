import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { isValidFacturaCantidad } from '../factura.domain';

const updateFacturaItemSchema = z
  .object({
    productoId: z
      .number()
      .int({ message: 'productoId debe ser un entero' })
      .positive({ message: 'productoId debe ser mayor a 0' }),
    cantidad: z
      .number()
      .positive({ message: 'cantidad debe ser mayor a 0' })
      .optional(),
    unidad: z.enum(['u', 'kg', 'g']).optional(),
    descuento: z
      .number()
      .min(0, { message: 'descuento no puede ser negativo' })
      .max(100, { message: 'descuento no puede ser mayor a 100' })
      .optional(),
    precioUnitario: z
      .number()
      .positive({ message: 'precioUnitario debe ser mayor a 0' })
      .optional(),
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
    .optional(),
  lugarCompra: z.string().min(1).optional(),
  nitProveedor: z.string().optional(),
  fechaHoraCompra: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'La fecha debe ser valida (ISO 8601)',
    })
    .optional(),
  items: z.array(updateFacturaItemSchema).min(1).optional(),
});

export class UpdateFacturaDto extends createZodDto(updateFacturaSchema) {}
