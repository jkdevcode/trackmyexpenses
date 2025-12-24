import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

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
          metodoPago: dto.metodoPago as any, // Enum cast
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

  async findAll(userId: number) {
    try {
      const facturas = await this.prisma.factura.findMany({
        where: { usuarioId: userId },
        orderBy: { fechaHoraCompra: 'desc' },
      });

      return {
        status: 200,
        message: 'Facturas obtenidas exitosamente',
        facturas,
        total: facturas.length
      };
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      throw new InternalServerErrorException('Error al obtener facturas');
    }
  }

  async addProducto(userId: number, facturaId: number, dto: any) {
    // dto is { productoId, cantidad, descuento } from AddProductoFacturaDto
    
    // Check Factura ownership
    const factura = await this.prisma.factura.findUnique({
      where: { id: facturaId },
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }
    
    if (factura.usuarioId !== userId) {
       throw new ForbiddenException('No tienes permiso para modificar esta factura');
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
            totalPagar: { increment: precioTotal }
          },
          include: {
            productos: {
              include: { producto: true }
            }
          }
        });

        return { fp, updatedFactura };
      });

      return {
        status: 201,
        message: 'Producto agregado a factura exitosamente',
        data: result
      };

    } catch (error) {
       if (error.code === 'P2002') { // Unique constraint violation? (facturaId, productoId)
          throw new ConflictException('El producto ya está en la factura');
       }
       console.error('Error agregando producto:', error);
       throw new InternalServerErrorException('Error al agregar producto a factura');
    }
  }
}
