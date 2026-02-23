import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const fechaRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/;

const createFacturaSchema = z.object({
  // Mapped from 'fecha' in requirement to 'fechaHoraCompra' or just 'fecha' and mapped in service
  fecha: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'La fecha debe ser válida (ISO 8601)',
  }),

  total: z
    .number()
    .positive({ message: 'El total debe ser un número positivo' }),

  // Extra fields required by schema but not explicitly requested by user as input?
  // User said "Campos obligatorios: fecha, total".
  // Schema needs: codigoFactura, metodoPago, lugarCompra.
  // I will check existing controller logic.
  // If usage implies these are generated or defaulted, I will do so.
  // If they are inputs, I will add them optional or required.
  // Assuming 'Factura' creation mimics a simple receipt entry for now.

  metodoPago: z
    .enum([
      'EFECTIVO',
      'TARJETA_CREDITO',
      'TARJETA_DEBITO',
      'TRANSFERENCIA',
      'OTRO',
    ])
    .optional()
    .default('EFECTIVO'),
  lugarCompra: z.string().min(1).optional().default('Comercio Desconocido'),
  nitProveedor: z.string().optional(),

  // codigoFactura usually generated.
});

export class CreateFacturaDto extends createZodDto(createFacturaSchema) {}
