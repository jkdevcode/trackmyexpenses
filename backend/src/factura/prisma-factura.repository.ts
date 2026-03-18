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
  UpdateFacturaProductoPrecioTotalInput,
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
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
        productos: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                precioUnitario: true,
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

  async findProductoById(productoId: number) {
    return await this.prisma.producto.findUnique({
      where: { id: productoId },
      select: { id: true, precioUnitario: true },
    });
  }

  async countFacturasByUser(userId: number) {
    return await this.prisma.factura.count({ where: { usuarioId: userId } });
  }

  async sumTotalPagarByUserAndRange(
    userId: number,
    range: FacturaStatsDateRange,
  ) {
    const aggregate = await this.prisma.factura.aggregate({
      where: {
        usuarioId: userId,
        fechaHoraCompra: {
          gte: range.startDate,
          lte: range.endDate,
        },
      },
      _sum: {
        totalPagar: true,
      },
    });

    return Number(aggregate._sum.totalPagar) || 0;
  }
}

class PrismaFacturaRepositoryTx implements FacturaRepositoryTx {
  constructor(private readonly tx: Prisma.TransactionClient) {}

  async findProductosByIds(productIds: number[]) {
    return await this.tx.producto.findMany({
      where: { id: { in: productIds } },
      select: { id: true, precioUnitario: true },
    });
  }

  async findFacturaProductosByFacturaId(facturaId: number) {
    return await this.tx.facturaProducto.findMany({
      where: { facturaId },
      select: {
        id: true,
        productoId: true,
        cantidad: true,
        descuento: true,
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

    return await this.tx.factura.update({
      where: { id: facturaId },
      data: updateData,
    });
  }

  async updateFacturaProductoPrecioTotal(
    data: UpdateFacturaProductoPrecioTotalInput,
  ) {
    return await this.tx.facturaProducto.update({
      where: {
        facturaId_productoId: {
          facturaId: data.facturaId,
          productoId: data.productoId,
        },
      },
      data: {
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
          cantidad: data.cantidad,
          unidad: data.unidad,
          descuento: new Prisma.Decimal(data.descuento),
          precioTotal: new Prisma.Decimal(data.precioTotal),
        },
        select: {
          id: true,
          facturaId: true,
          productoId: true,
          cantidad: true,
          descuento: true,
          precioTotal: true,
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
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
        productos: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                precioUnitario: true,
              },
            },
          },
        },
      },
    });
  }

  async findProductoByNombre(nombre: string) {
    return await this.tx.producto.findFirst({
      where: { nombre },
      select: { id: true },
    });
  }

  async createProducto(data: CreateProductoInput) {
    return await this.tx.producto.create({
      data: {
        nombre: data.nombre,
        codigo: data.codigo,
        precioUnitario: new Prisma.Decimal(data.precioUnitario),
      },
      select: { id: true },
    });
  }

  async updateFacturaTotalAndGetDetails(facturaId: number, increment: number) {
    return await this.tx.factura.update({
      where: { id: facturaId },
      data: {
        totalPagar: { increment },
      },
      select: {
        id: true,
        codigoFactura: true,
        totalPagar: true,
        productos: {
          select: {
            id: true,
            productoId: true,
            cantidad: true,
            descuento: true,
            precioTotal: true,
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
