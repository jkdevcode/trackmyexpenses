import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const productoConfirmadoSchema = z.object({
  nombreDetectado: z.string().min(1).describe('Extracted name of the item'),
  precioUnitario: z.string().or(z.number()).describe('Extracted unit price'),
  cantidadDetectada: z
    .string()
    .or(z.number())
    .default(1)
    .describe('Extracted quantity'),
  unidadDetectada: z
    .string()
    .optional()
    .default('u')
    .describe('Extracted unit of measurement'),
  pesoDetectado: z
    .string()
    .or(z.number())
    .optional()
    .describe('Extracted weight (if applicable)'),
  descuentoDetectado: z
    .string()
    .or(z.number())
    .optional()
    .default(0)
    .describe('Extracted discount applied'),
});

const facturaConfirmadaSchema = z.object({
  factura: z.object({
    fechaHoraCompra: z
      .string()
      .datetime({ message: 'Fecha invalida (ISO)' })
      .describe('Confirmed date and time of purchase'),
    metodoPago: z
      .enum([
        'EFECTIVO',
        'TARJETA_CREDITO',
        'TARJETA_DEBITO',
        'TRANSFERENCIA',
        'OTRO',
      ])
      .default('EFECTIVO')
      .describe('Confirmed payment method'),
    moneda: z
      .string()
      .trim()
      .length(3, { message: 'moneda debe tener 3 letras' })
      .optional()
      .describe('Confirmed currency'),
    tasaCambio: z.coerce
      .number()
      .positive({ message: 'tasaCambio debe ser mayor a 0' })
      .optional()
      .describe('Confirmed exchange rate'),
    lugarCompra: z
      .string()
      .min(1)
      .describe('Confirmed store or place of purchase'),
    nitProveedor: z
      .string()
      .optional()
      .describe('Confirmed supplier tax ID or NIT'),
    totalPagar: z
      .string()
      .or(z.number())
      .optional()
      .describe('Confirmed total amount paid'),
  }),
  productos: z
    .array(productoConfirmadoSchema)
    .min(1, { message: 'Debe haber al menos un producto' })
    .describe('List of confirmed products'),
});

export class ConfirmFacturaDto extends createZodDto(facturaConfirmadaSchema) {}
