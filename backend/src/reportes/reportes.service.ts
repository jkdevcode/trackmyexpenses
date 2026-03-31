import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from './pdf.service';
import { RequestContext } from '../common/context/request-context';

type FacturaWithProductos = Prisma.FacturaGetPayload<{
  include: {
    productos: {
      include: {
        producto: true;
      };
    };
  };
}>;

type ProductoTop = {
  nombre: string;
  cantidad: number;
};

@Injectable()
export class ReportesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly logger: Logger,
  ) {}

  async generateFacturasReport(
    userId: number,
    from: string,
    to: string,
  ): Promise<Buffer> {
    const { fromDate, toDate } = this.parseDateRange(from, to);

    try {
      const facturas = await this.prisma.factura.findMany({
        where: {
          usuarioId: userId,
          fechaHoraCompra: {
            gte: fromDate,
            lte: toDate,
          },
        },
        include: {
          productos: {
            include: {
              producto: true,
            },
          },
        },
        orderBy: {
          fechaHoraCompra: 'asc',
        },
      });

      const totalFacturas = facturas.length;
      const totalGastado = facturas.reduce((acc, factura) => {
        const total = this.decimalToNumber(
          factura.totalPagarBase ?? factura.totalPagar,
        );
        return acc + total;
      }, 0);

      const currencySummary = this.getReportCurrency(facturas);
      const productosTop = this.getTopProductos(facturas);

      const html = this.buildHtml({
        facturas,
        totalFacturas,
        totalGastado,
        productosTop,
        from,
        to,
        currencySummary,
        hasMixedCurrencies: this.hasMixedCurrencies(facturas),
      });

      return this.pdfService.generatePdf(html);
    } catch (error: unknown) {
      this.logger.error({
        msg: 'Error al generar reporte de facturas',
        requestId: RequestContext.getRequestId(),
        error,
      });
      throw new InternalServerErrorException(
        'Error al generar reporte de facturas',
      );
    }
  }

  async checkFacturasReport(
    userId: number,
    from: string,
    to: string,
  ): Promise<{ hasData: boolean; count: number }> {
    const { fromDate, toDate } = this.parseDateRange(from, to);

    const count = await this.prisma.factura.count({
      where: {
        usuarioId: userId,
        fechaHoraCompra: {
          gte: fromDate,
          lte: toDate,
        },
      },
    });

    return { hasData: count > 0, count };
  }

  private parseDateRange(from: string, to: string) {
    const fromDate = this.parseDateOnly(from, false);
    const toDate = this.parseDateOnly(to, true);

    if (fromDate >= toDate) {
      throw new BadRequestException('La fecha "from" debe ser menor que "to"');
    }

    return { fromDate, toDate };
  }

  private parseDateOnly(value: string, endOfDay: boolean) {
    const [year, month, day] = value.split('-').map((part) => Number(part));

    if (!year || !month || !day) {
      throw new BadRequestException('Fecha invalida');
    }

    const date = new Date(
      year,
      month - 1,
      day,
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 999 : 0,
    );

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Fecha invalida');
    }

    return date;
  }

  private getTopProductos(facturas: FacturaWithProductos[]): ProductoTop[] {
    const totals = new Map<string, number>();

    for (const factura of facturas) {
      for (const item of factura.productos) {
        const nombre =
          item.productoNombre ?? item.producto?.nombre ?? 'Producto sin nombre';
        const key = nombre.trim() === '' ? 'Producto sin nombre' : nombre;
        totals.set(key, (totals.get(key) ?? 0) + item.cantidad);
      }
    }

    return Array.from(totals.entries())
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);
  }

  private getReportCurrency(facturas: FacturaWithProductos[]) {
    const currencies = new Set(
      facturas.map((factura) =>
        (factura.monedaBase ?? factura.moneda ?? 'COP').toUpperCase(),
      ),
    );

    if (currencies.size === 1) {
      return Array.from(currencies)[0];
    }

    return 'COP';
  }

  private hasMixedCurrencies(facturas: FacturaWithProductos[]) {
    const currencies = new Set(
      facturas.map((factura) =>
        (factura.monedaBase ?? factura.moneda ?? 'COP').toUpperCase(),
      ),
    );

    return currencies.size > 1;
  }

  private formatDate(date: Date) {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  private formatCurrency(amount: number, currency: string) {
    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private decimalToNumber(
    value: Prisma.Decimal | number | string | null | undefined,
  ) {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return Number(value);
    return value.toNumber();
  }

  private buildHtml({
    facturas,
    totalFacturas,
    totalGastado,
    productosTop,
    from,
    to,
    currencySummary,
    hasMixedCurrencies,
  }: {
    facturas: FacturaWithProductos[];
    totalFacturas: number;
    totalGastado: number;
    productosTop: ProductoTop[];
    from: string;
    to: string;
    currencySummary: string;
    hasMixedCurrencies: boolean;
  }) {
    const facturaRows =
      facturas.length === 0
        ? `<tr><td colspan="3" class="muted">Sin facturas en el rango</td></tr>`
        : facturas
            .map((factura) => {
              const total = this.decimalToNumber(
                factura.totalPagarBase ?? factura.totalPagar,
              );
              const currency = (
                factura.monedaBase ??
                factura.moneda ??
                'COP'
              ).toUpperCase();
              return `<tr>
  <td>${this.formatDate(factura.fechaHoraCompra)}</td>
  <td>${this.escapeHtml(factura.lugarCompra)}</td>
  <td class="right">${this.formatCurrency(total, currency)}</td>
</tr>`;
            })
            .join('');

    const productosRows =
      productosTop.length === 0
        ? `<tr><td colspan="2" class="muted">Sin productos registrados</td></tr>`
        : productosTop
            .map(
              (producto) => `<tr>
  <td>${this.escapeHtml(producto.nombre)}</td>
  <td class="right">${producto.cantidad}</td>
</tr>`,
            )
            .join('');

    const totalGastadoLabel = this.formatCurrency(
      totalGastado,
      currencySummary,
    );

    const currencyNote = hasMixedCurrencies
      ? `<p class="note">Nota: Se detectaron monedas mixtas en las facturas. El total se muestra en ${currencySummary} sin conversion automatica.</p>`
      : '';

    return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Reporte de gastos</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; color: #1f2933; margin: 24px; }
      h1 { font-size: 22px; margin: 0 0 8px; }
      h2 { font-size: 16px; margin: 24px 0 8px; }
      .summary { display: flex; gap: 24px; margin-top: 12px; }
      .summary-card { border: 1px solid #e0e7ff; padding: 12px; border-radius: 8px; background: #f8fafc; min-width: 180px; }
      .summary-card strong { display: block; font-size: 18px; margin-top: 4px; }
      .muted { color: #6b7280; text-align: center; }
      .note { margin: 8px 0 0; color: #6b7280; font-size: 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; }
      th { background: #f1f5f9; text-align: left; }
      .right { text-align: right; }
    </style>
  </head>
  <body>
    <h1>Reporte de gastos</h1>
    <p>Rango: <strong>${this.escapeHtml(from)}</strong> a <strong>${this.escapeHtml(
      to,
    )}</strong></p>
    <div class="summary">
      <div class="summary-card">
        Total gastado
        <strong>${totalGastadoLabel}</strong>
      </div>
      <div class="summary-card">
        Total de facturas
        <strong>${totalFacturas}</strong>
      </div>
    </div>
    ${currencyNote}

    <h2>Facturas</h2>
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Lugar</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${facturaRows}
      </tbody>
    </table>

    <h2>Top productos</h2>
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
        </tr>
      </thead>
      <tbody>
        ${productosRows}
      </tbody>
    </table>
  </body>
</html>`;
  }
}
