import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const addProductoToFacturaSchema = z.object({
  productoId: z.number().int().positive({ message: 'ID de producto inválido' }),
  cantidad: z
    .number()
    .int()
    .positive({ message: 'La cantidad debe ser mayor a 0' }),
  descuento: z.number().min(0).max(100).optional().default(0),
  precioUnitario: z
    .number()
    .positive({ message: 'precioUnitario debe ser mayor a 0' })
    .optional(),
});

export class AddProductoFacturaDto extends createZodDto(
  addProductoToFacturaSchema,
) {}
