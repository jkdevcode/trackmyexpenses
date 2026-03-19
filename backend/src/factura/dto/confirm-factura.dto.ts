import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const productoConfirmadoSchema = z.object({
  nombreDetectado: z.string().min(1),
  precioUnitario: z.string().or(z.number()),
  cantidadDetectada: z.string().or(z.number()).default(1),
  unidadDetectada: z.string().optional().default('u'),
  pesoDetectado: z.string().or(z.number()).optional(),
  descuentoDetectado: z.string().or(z.number()).optional().default(0),
});

const facturaConfirmadaSchema = z.object({
  factura: z.object({
    fechaHoraCompra: z.string().datetime({ message: 'Fecha invalida (ISO)' }),
    metodoPago: z
      .enum([
        'EFECTIVO',
        'TARJETA_CREDITO',
        'TARJETA_DEBITO',
        'TRANSFERENCIA',
        'OTRO',
      ])
      .default('EFECTIVO'),
    moneda: z
      .string()
      .trim()
      .length(3, { message: 'moneda debe tener 3 letras' })
      .optional(),
    tasaCambio: z.coerce
      .number()
      .positive({ message: 'tasaCambio debe ser mayor a 0' })
      .optional(),
    lugarCompra: z.string().min(1),
    nitProveedor: z.string().optional(),
    totalPagar: z.string().or(z.number()).optional(),
  }),
  productos: z
    .array(productoConfirmadoSchema)
    .min(1, { message: 'Debe haber al menos un producto' }),
});

export class ConfirmFacturaDto extends createZodDto(facturaConfirmadaSchema) {}
