import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Zod schemas for validation
const productoConfirmadoSchema = z.object({
  nombreDetectado: z.string().min(1),
  precioUnitario: z.string().or(z.number()), // Input might be string from OCR form
  cantidadDetectada: z.string().or(z.number()).default(1),
  unidadDetectada: z.string().optional().default('u'),
  pesoDetectado: z.string().or(z.number()).optional(), // e.g. "200" for 200g
  descuentoDetectado: z.string().or(z.number()).optional().default(0),
});

const facturaConfirmadaSchema = z.object({
  factura: z.object({
    fechaHoraCompra: z.string().datetime({ message: 'Fecha inválida (ISO)' }),
    metodoPago: z
      .enum([
        'EFECTIVO',
        'TARJETA_CREDITO',
        'TARJETA_DEBITO',
        'TRANSFERENCIA',
        'OTRO',
      ])
      .default('EFECTIVO'),
    lugarCompra: z.string().min(1),
    nitProveedor: z.string().optional(),
    totalPagar: z.string().or(z.number()).optional(), // Optional implies recalc? Or required for validation? We'll recalc but good to have.
  }),
  productos: z
    .array(productoConfirmadoSchema)
    .min(1, { message: 'Debe haber al menos un producto' }),
});

export class ConfirmFacturaDto extends createZodDto(facturaConfirmadaSchema) {}
