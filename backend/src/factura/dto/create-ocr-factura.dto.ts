import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const productoOcrSchema = z.object({
  nombreDetectado: z.string().min(1),
  precioUnitario: z.coerce.number().positive(),
  cantidadDetectada: z.coerce.number().positive().default(1),
  unidadDetectada: z.string().optional().default('u'),
  descuentoDetectado: z.coerce.number().min(0).max(100).optional().default(0),
});

const createOcrFacturaSchema = z.object({
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
  fechaHoraCompra: z.string().datetime({ message: 'Fecha invalida (ISO)' }),
  totalPagar: z.coerce.number().optional(),
  ocrSource: z.enum(['ai', 'ai-image', 'ocr', 'fallback']),
  items: z.array(productoOcrSchema),
});

export class CreateOcrFacturaDto extends createZodDto(createOcrFacturaSchema) {}
