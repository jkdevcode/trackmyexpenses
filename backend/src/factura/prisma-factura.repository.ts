import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DomainConflictError } from '../common/errors/domain-conflict.error';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFacturaProductoInput,
  CreateFacturaRecordInput,
  CreateProductoInput,
  FacturaRepository,
  FacturaRepositoryTx,
  FacturaStatsDateRange,
  UpdateFacturaProductoSnapshotInput,
  UpdateFacturaRecordInput,
} from './factura.repository.port';

const FACTURA_LIST_SELECT = {
  id: true,
  codigoFactura: true,
  metodoPago: true,
  lugarCompra: true,
  nitProveedor: true,
  fechaHoraCompra: true,
  totalPagar: true,
  moneda: true,
  monedaBase: true,
  tasaCambio: true,
  totalPagarBase: true,
  imagenUrl: true,
  ocrSource: true,
  usuarioId: true,
} as const;

@Injectable()
export class PrismaFacturaRepository implements FacturaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async transaction<T>(
    callback: (tx: FacturaRepositoryTx) => Promise<T>,
  ): Promise<T> {
    return await this.prisma.$transaction((tx) =>
      callback(new PrismaFacturaRepositoryTx(tx)),
    );
  }

  async findFacturasByUserAndRange(
    userId: number,
    range: FacturaStatsDateRange,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;

    return await this.prisma.factura.findMany({
      where: {
        usuarioId: userId,
        fechaHoraCompra: {
          gte: range.startDate,
          lte: range.endDate,
        },
      },
      orderBy: {
        fechaHoraCompra: 'desc',
      },
      skip,
      take: limit,
      select: FACTURA_LIST_SELECT,
    });
  }

  async countFacturasByUserAndRange(
    userId: number,
    range: FacturaStatsDateRange,
  ) {
    return await this.prisma.factura.count({
      where: {
        usuarioId: userId,
        fechaHoraCompra: {
          gte: range.startDate,
          lte: range.endDate,
        },
      },
    });
  }

  async findFacturaDetailByUser(userId: number, facturaId: number) {
    return await this.prisma.factura.findFirst({
      where: {
        id: facturaId,
        usuarioId: userId,
      },
      select: {
        id: true,
        codigoFactura: true,
        metodoPago: true,
        lugarCompra: true,
        nitProveedor: true,
        fechaHoraCompra: true,
        totalPagar: true,
        moneda: true,
        monedaBase: true,
        tasaCambio: true,
        tasaCambioFecha: true,
        tasaCambioFuente: true,
        totalPagarBase: true,
        imagenUrl: true,
        ocrSource: true,
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
        productos: {
          select: {
            id: true,
            productoId: true,
            cantidad: true,
            unidad: true,
            descuento: true,
            precioUnitario: true,
            precioTotal: true,
            productoNombre: true,
            productoCodigo: true,
            producto: {
              select: {
                id: true,
                nombre: true,
                precioUnitario: true,
                codigo: true,
              },
            },
          },
        },
      },
    });
  }

  async findFacturaIdByUser(userId: number, facturaId: number) {
    return await this.prisma.factura.findFirst({
      where: {
        id: facturaId,
        usuarioId: userId,
      },
      select: { id: true },
    });
  }

  async findFacturaCurrencyByUser(userId: number, facturaId: number) {
    return await this.prisma.factura.findFirst({
      where: {
        id: facturaId,
        usuarioId: userId,
      },
      select: {
        id: true,
        totalPagar: true,
        totalPagarBase: true,
        moneda: true,
        monedaBase: true,
        tasaCambio: true,
      },
    });
  }

  async findProductoById(userId: number, productoId: number) {
    return await this.prisma.producto.findFirst({
      where: { id: productoId, usuarioId: userId },
      select: { id: true, precioUnitario: true, nombre: true, codigo: true },
    });
  }

  async findUsuarioMonedaBase(userId: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { monedaBase: true },
    });
    return user?.monedaBase ?? null;
  }

  async countFacturasByUser(userId: number) {
    return await this.prisma.factura.count({ where: { usuarioId: userId } });
  }

  async sumTotalPagarByUserAndRange(
    userId: number,
    range: FacturaStatsDateRange,
  ) {
    const result = await this.prisma.$queryRaw<
      Array<{ total: Prisma.Decimal | null }>
    >`
      SELECT COALESCE(SUM(COALESCE(totalPagarBase, totalPagar)), 0) AS total
      FROM Factura
      WHERE usuarioId = ${userId}
        AND fechaHoraCompra >= ${range.startDate}
        AND fechaHoraCompra <= ${range.endDate}
    `;

    return Number(result[0]?.total ?? 0);
  }
}

class PrismaFacturaRepositoryTx implements FacturaRepositoryTx {
  constructor(private readonly tx: Prisma.TransactionClient) {}

  async findProductosByIds(userId: number, productIds: number[]) {
    return await this.tx.producto.findMany({
      where: {
        id: { in: productIds },
        usuarioId: userId,
      },
      select: { id: true, precioUnitario: true, nombre: true, codigo: true },
    });
  }

  async findFacturaProductosByFacturaId(facturaId: number) {
    return await this.tx.facturaProducto.findMany({
      where: { facturaId },
      select: {
        id: true,
        productoId: true,
        cantidad: true,
        unidad: true,
        descuento: true,
        precioUnitario: true,
        precioTotal: true,
      },
    });
  }

  async createFactura(data: CreateFacturaRecordInput) {
    return await this.tx.factura.create({
      data: {
        usuarioId: data.usuarioId,
        codigoFactura: data.codigoFactura,
        metodoPago: data.metodoPago,
        lugarCompra: data.lugarCompra,
        nitProveedor: data.nitProveedor,
        fechaHoraCompra: data.fechaHoraCompra,
        totalPagar: new Prisma.Decimal(data.totalPagar),
        moneda: data.moneda ?? null,
        monedaBase: data.monedaBase ?? null,
        tasaCambio:
          data.tasaCambio === undefined || data.tasaCambio === null
            ? null
            : new Prisma.Decimal(data.tasaCambio),
        tasaCambioFecha: data.tasaCambioFecha ?? null,
        tasaCambioFuente: data.tasaCambioFuente ?? null,
        totalPagarBase:
          data.totalPagarBase === undefined || data.totalPagarBase === null
            ? null
            : new Prisma.Decimal(data.totalPagarBase),
        imagenUrl: data.imagenUrl ?? null,
        ocrSource: data.ocrSource ?? null,
      },
      select: { id: true },
    });
  }

  async updateFactura(facturaId: number, data: UpdateFacturaRecordInput) {
    const updateData: Prisma.FacturaUpdateInput = {};

    if (data.metodoPago !== undefined) {
      updateData.metodoPago = data.metodoPago;
    }
    if (data.lugarCompra !== undefined) {
      updateData.lugarCompra = data.lugarCompra;
    }
    if (data.nitProveedor !== undefined) {
      updateData.nitProveedor = data.nitProveedor;
    }
    if (data.fechaHoraCompra !== undefined) {
      updateData.fechaHoraCompra = data.fechaHoraCompra;
    }
    if (data.totalPagar !== undefined) {
      updateData.totalPagar = new Prisma.Decimal(data.totalPagar);
    }
    if (data.moneda !== undefined) {
      updateData.moneda = data.moneda;
    }
    if (data.monedaBase !== undefined) {
      updateData.monedaBase = data.monedaBase;
    }
    if (data.tasaCambio !== undefined) {
      updateData.tasaCambio =
        data.tasaCambio === null ? null : new Prisma.Decimal(data.tasaCambio);
    }
    if (data.tasaCambioFecha !== undefined) {
      updateData.tasaCambioFecha = data.tasaCambioFecha;
    }
    if (data.tasaCambioFuente !== undefined) {
      updateData.tasaCambioFuente = data.tasaCambioFuente;
    }
    if (data.totalPagarBase !== undefined) {
      updateData.totalPagarBase =
        data.totalPagarBase === null
          ? null
          : new Prisma.Decimal(data.totalPagarBase);
    }

    return await this.tx.factura.update({
      where: { id: facturaId },
      data: updateData,
    });
  }

  async updateFacturaProductoSnapshot(
    data: UpdateFacturaProductoSnapshotInput,
  ) {
    return await this.tx.facturaProducto.update({
      where: {
        facturaId_productoId: {
          facturaId: data.facturaId,
          productoId: data.productoId,
        },
      },
      data: {
        cantidad: new Prisma.Decimal(data.cantidad),
        unidad: data.unidad ?? null,
        descuento: new Prisma.Decimal(data.descuento),
        precioUnitario: new Prisma.Decimal(data.precioUnitario),
        precioTotal: new Prisma.Decimal(data.precioTotal),
      },
    });
  }

  async deleteFacturaProductosByFacturaId(facturaId: number) {
    const result = await this.tx.facturaProducto.deleteMany({
      where: { facturaId },
    });
    return result.count;
  }

  async deleteFacturaById(facturaId: number) {
    await this.tx.factura.delete({
      where: { id: facturaId },
    });
  }

  async createFacturaProducto(data: CreateFacturaProductoInput) {
    try {
      return await this.tx.facturaProducto.create({
        data: {
          facturaId: data.facturaId,
          productoId: data.productoId,
          cantidad: new Prisma.Decimal(data.cantidad),
          unidad: data.unidad,
          descuento: new Prisma.Decimal(data.descuento),
          precioUnitario: new Prisma.Decimal(data.precioUnitario),
          precioTotal: new Prisma.Decimal(data.precioTotal),
          productoNombre: data.productoNombre,
          productoCodigo: data.productoCodigo,
        },
        select: {
          id: true,
          facturaId: true,
          productoId: true,
          cantidad: true,
          unidad: true,
          descuento: true,
          precioUnitario: true,
          precioTotal: true,
          productoNombre: true,
          productoCodigo: true,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new DomainConflictError('El producto ya esta en la factura');
      }
      throw error;
    }
  }

  async findFacturaByIdWithRelations(facturaId: number) {
    return await this.tx.factura.findUniqueOrThrow({
      where: { id: facturaId },
      select: {
        id: true,
        codigoFactura: true,
        metodoPago: true,
        lugarCompra: true,
        nitProveedor: true,
        fechaHoraCompra: true,
        totalPagar: true,
        moneda: true,
        monedaBase: true,
        tasaCambio: true,
        tasaCambioFecha: true,
        tasaCambioFuente: true,
        totalPagarBase: true,
        imagenUrl: true,
        ocrSource: true,
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
        productos: {
          select: {
            id: true,
            productoId: true,
            cantidad: true,
            unidad: true,
            descuento: true,
            precioUnitario: true,
            precioTotal: true,
            productoNombre: true,
            productoCodigo: true,
            producto: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                precioUnitario: true,
              },
            },
          },
        },
      },
    });
  }

  async findProductoByNombre(userId: number, nombre: string) {
    return await this.tx.producto.findFirst({
      where: { nombre, usuarioId: userId },
      select: { id: true },
    });
  }

  async createProducto(userId: number, data: CreateProductoInput) {
    return await this.tx.producto.create({
      data: {
        nombre: data.nombre,
        codigo: data.codigo,
        precioUnitario: new Prisma.Decimal(data.precioUnitario),
        usuarioId: userId,
      },
      select: { id: true },
    });
  }

  async updateFacturaTotalAndGetDetails(
    facturaId: number,
    increment: number,
    incrementBase: number,
  ) {
    return await this.tx.factura.update({
      where: { id: facturaId },
      data: {
        totalPagar: { increment },
        totalPagarBase: { increment: incrementBase },
      },
      select: {
        id: true,
        codigoFactura: true,
        totalPagar: true,
        moneda: true,
        monedaBase: true,
        tasaCambio: true,
        tasaCambioFecha: true,
        tasaCambioFuente: true,
        totalPagarBase: true,
        imagenUrl: true,
        ocrSource: true,
        productos: {
          select: {
            id: true,
            productoId: true,
            cantidad: true,
            unidad: true,
            descuento: true,
            precioUnitario: true,
            precioTotal: true,
            productoNombre: true,
            productoCodigo: true,
            producto: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                precioUnitario: true,
              },
            },
          },
        },
      },
    });
  }
}
