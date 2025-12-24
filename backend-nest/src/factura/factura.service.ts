import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { v4 as uuidv4 } from 'uuid';

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
}
