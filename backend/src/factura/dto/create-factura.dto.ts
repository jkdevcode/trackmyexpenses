import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const facturaItemSchema = z.object({
  productoId: z
    .number()
    .int({ message: 'productoId debe ser un entero' })
    .positive({ message: 'productoId debe ser mayor a 0' }),
  cantidad: z
    .number()
    .int({ message: 'cantidad debe ser un entero' })
    .positive({ message: 'cantidad debe ser mayor a 0' }),
  descuento: z
    .number()
    .min(0, { message: 'descuento no puede ser negativo' })
    .max(100, { message: 'descuento no puede ser mayor a 100' })
    .optional(),
});

const createFacturaSchema = z.object({
  metodoPago: z.enum([
    'EFECTIVO',
    'TARJETA_CREDITO',
    'TARJETA_DEBITO',
    'TRANSFERENCIA',
    'OTRO',
  ]),
  lugarCompra: z.string().min(1),
  nitProveedor: z.string().optional(),
  fechaHoraCompra: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'La fecha debe ser valida (ISO 8601)',
    })
    .optional(),
  items: z
    .array(facturaItemSchema)
    .min(1, { message: 'Debe haber al menos un item' }),
});

export class CreateFacturaDto extends createZodDto(createFacturaSchema) {}
