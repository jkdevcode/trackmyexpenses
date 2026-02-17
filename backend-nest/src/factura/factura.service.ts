import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddProductoFacturaDto } from './dto/add-producto.dto';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { Prisma } from '@prisma/client';

import { PeriodFilter } from './factura.types';

@Injectable()
export class FacturaService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateFacturaDto) {
    try {
      // Map DTO fields to Schema fields
      // DTO has: fecha, total, metodoPago, lugarCompra, nitProveedor
      // Schema needs: codigoFactura, metodoPago, lugarCompra, nitProveedor, fechaHoraCompra, totalPagar, usuarioId

      const codigoFactura = `FAC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const factura = await this.prisma.factura.create({
        data: {
          codigoFactura: codigoFactura,
          metodoPago: dto.metodoPago, // Enum cast
          lugarCompra: dto.lugarCompra || 'Comercio Desconocido',
          nitProveedor: dto.nitProveedor,
          fechaHoraCompra: new Date(dto.fecha),
          totalPagar: dto.total,
          usuarioId: userId,
          // productos: {} // No products for now
        },
      });

      return {
        status: 201,
        message: 'Factura creada exitosamente',
        factura,
      };
    } catch (error) {
      console.error('Error al crear factura:', error);
      throw new InternalServerErrorException('Error al crear factura');
    }
  }

  async findAll(
    userId: number,
    period: PeriodFilter = 'month',
    page = 1,
    limit = 20,
  ) {
    try {
      const now = new Date();
      const startDate = new Date();
      const endDate = new Date();
      let prevStartDate = new Date();
      let prevEndDate = new Date();

      // Reset hours
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      // Determine date ranges
      switch (period) {
        case 'day':
          // Today matches default start/end
          prevStartDate.setDate(now.getDate() - 1);
          prevStartDate.setHours(0, 0, 0, 0);
          prevEndDate.setDate(now.getDate() - 1);
          prevEndDate.setHours(23, 59, 59, 999);
          break;
        case 'week': {
          // Current week (starting Monday)
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
          startDate.setDate(diff);

          prevStartDate = new Date(startDate);
          prevStartDate.setDate(startDate.getDate() - 7);
          prevEndDate = new Date(prevStartDate);
          prevEndDate.setDate(prevStartDate.getDate() + 6);
          prevEndDate.setHours(23, 59, 59, 999);
          break;
        }
        case 'year':
          startDate.setMonth(0, 1);

          prevStartDate.setFullYear(now.getFullYear() - 1, 0, 1);
          prevStartDate.setHours(0, 0, 0, 0);
          prevEndDate.setFullYear(now.getFullYear() - 1, 11, 31);
          prevEndDate.setHours(23, 59, 59, 999);
          break;
        case 'month':
        default:
          startDate.setDate(1);

          prevStartDate.setMonth(now.getMonth() - 1, 1);
          prevStartDate.setHours(0, 0, 0, 0);
          prevEndDate.setDate(0); // Last day of previous month
          prevEndDate.setHours(23, 59, 59, 999);
          break;
      }

      // Fetch current period invoices
      const where = {
        usuarioId: userId,
        fechaHoraCompra: {
          gte: startDate,
          lte: endDate,
        },
      };

      const skip = (page - 1) * limit;

      const facturas = await this.prisma.factura.findMany({
        where,
        orderBy: {
          fechaHoraCompra: 'desc',
        },
        skip,
        take: limit,
      });

      const total = await this.prisma.factura.count({
        where,
      });

      const currentPeriodAggregate = await this.prisma.factura.aggregate({
        where,
        _sum: {
          totalPagar: true,
        },
      });

      // Calculate current stats
      const currentPeriodInvoices = total;
      const totalSpending = Number(currentPeriodAggregate._sum.totalPagar) || 0;
      const totalInvoices = await this.prisma.factura.count({
        where: { usuarioId: userId },
      });

      // Fetch previous period total for trend
      const prevFacturasAggregate = await this.prisma.factura.aggregate({
        where: {
          usuarioId: userId,
          fechaHoraCompra: {
            gte: prevStartDate,
            lte: prevEndDate,
          },
        },
        _sum: {
          totalPagar: true,
        },
      });

      const prevTotalSpending =
        Number(prevFacturasAggregate._sum.totalPagar) || 0;

      // Calculate trend
      let spendingTrend = 0;
      if (prevTotalSpending > 0) {
        spendingTrend =
          ((totalSpending - prevTotalSpending) / prevTotalSpending) * 100;
      } else if (totalSpending > 0) {
        spendingTrend = 100; // 100% increase if previous was 0 and current is > 0
      }

      return {
        status: 200,
        message: 'Facturas obtenidas exitosamente',
        data: facturas,
        facturas,
        pagination: {
          page,
          limit,
          total,
        },
        stats: {
          currentPeriodInvoices,
          totalSpending,
          spendingTrend: Number(spendingTrend.toFixed(1)),
          totalInvoices,
        },
      };
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      throw new InternalServerErrorException('Error al obtener facturas');
    }
  }

  async addProducto(
    userId: number,
    facturaId: number,
    dto: AddProductoFacturaDto,
  ) {
    // Check Factura ownership
    const factura = await this.prisma.factura.findFirst({
      where: {
        id: facturaId,
        usuarioId: userId,
      },
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    // Check Producto existence
    const producto = await this.prisma.producto.findUnique({
      where: { id: dto.productoId },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Calculate totals
    const precioUnitario = Number(producto.precioUnitario);
    const descuento = dto.descuento || 0;
    const precioConDescuento = precioUnitario * (1 - descuento / 100);
    const precioTotal = precioConDescuento * dto.cantidad;

    try {
      // Transaction: Create FacturaProducto and Update Factura Total
      const result = await this.prisma.$transaction(async (tx) => {
        // Create relationship
        const fp = await tx.facturaProducto.create({
          data: {
            facturaId,
            productoId: dto.productoId,
            cantidad: dto.cantidad,
            descuento: new Prisma.Decimal(descuento),
            precioTotal: new Prisma.Decimal(precioTotal),
          },
        });

        // Recalculate total for safety or just increment?
        // Safer to sum all products again or increment.
        // Let's increment current total + new item total.
        // Wait, current total might be stale? Transaction ensures isolation mostly.
        // But better is implicit calc.
        // For simplicity: Update Total = Total + new item.

        const updatedFactura = await tx.factura.update({
          where: { id: facturaId },
          data: {
            totalPagar: { increment: precioTotal },
          },
          include: {
            productos: {
              include: { producto: true },
            },
          },
        });

        return { fp, updatedFactura };
      });

      return {
        status: 201,
        message: 'Producto agregado a factura exitosamente',
        data: result,
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('El producto ya está en la factura');
      }

      console.error('Error agregando producto:', error);

      throw new InternalServerErrorException(
        'Error al agregar producto a factura',
      );
    }
  }
}
