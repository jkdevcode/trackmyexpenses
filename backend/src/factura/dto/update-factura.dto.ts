import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateFacturaItemSchema = z.object({
  productoId: z
    .number()
    .int({ message: 'productoId debe ser un entero' })
    .positive({ message: 'productoId debe ser mayor a 0' }),
  precioUnitario: z
    .number()
    .positive({ message: 'precioUnitario debe ser mayor a 0' }),
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
