import type { Request, Response } from "express";
import { prisma } from "../prisma/prisma.js";
import { Prisma } from "@prisma/client";

// Crear una nueva factura con productos
export const crearFactura = async (req: Request, res: Response) => {
  try {
    const { 
      codigoFactura, 
      metodoPago, 
      lugarCompra, 
      nitProveedor, 
      fechaHoraCompra, 
      productos,
      usuarioId 
    } = req.body;

    // Validar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Calcular total de la factura
    let totalPagar = 0;
    const productosConPrecio: Array<{
      productoId: number;
      cantidad: number;
      descuento: number;
      precioTotal: number;
    }> = [];

    for (const prod of productos) {
      const producto = await prisma.producto.findUnique({
        where: { codigo: prod.codigo }
      });

      if (!producto) {
        return res.status(404).json({ 
          error: `Producto con código ${prod.codigo} no encontrado` 
        });
      }

      const descuento = prod.descuento || 0;
      const precioConDescuento = Number(producto.precioUnitario) * (1 - descuento / 100);
      const precioTotal = precioConDescuento * prod.cantidad;
      totalPagar += precioTotal;

      productosConPrecio.push({
        productoId: producto.id,
        cantidad: prod.cantidad,
        descuento: descuento,
        precioTotal: precioTotal
      });
    }

    // Crear la factura con sus productos
    const factura = await prisma.factura.create({
      data: {
        codigoFactura,
        metodoPago,
        lugarCompra,
        nitProveedor,
        fechaHoraCompra: new Date(fechaHoraCompra),
        totalPagar,
        usuarioId,
        productos: {
          create: productosConPrecio
        }
      },
      include: {
        productos: {
          include: {
            producto: true
          }
        },
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        }
      }
    });

    res.status(201).json({ 
      message: "Factura creada exitosamente", 
      factura 
    });
  } catch (error) {
    console.error("Error al crear factura:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: "El código de factura ya existe" });
      }
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener todas las facturas con filtros
export const obtenerFacturas = async (req: Request, res: Response) => {
  try {
    const { 
      usuarioId, 
      fechaInicio, 
      fechaFin, 
      metodoPago, 
      lugarCompra,
      page = 1,
      limit = 10
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Construir filtros
    const where: any = {};
    
    if (usuarioId) where.usuarioId = Number(usuarioId);
    if (metodoPago) where.metodoPago = metodoPago;
    if (lugarCompra) where.lugarCompra = { contains: lugarCompra as string };
    
    if (fechaInicio || fechaFin) {
      where.fechaHoraCompra = {};
      if (fechaInicio) where.fechaHoraCompra.gte = new Date(fechaInicio as string);
      if (fechaFin) where.fechaHoraCompra.lte = new Date(fechaFin as string);
    }

    const facturas = await prisma.factura.findMany({
      where,
      include: {
        productos: {
          include: {
            producto: true
          }
        },
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        }
      },
      orderBy: {
        fechaHoraCompra: 'desc'
      },
      skip,
      take: Number(limit)
    });

    const total = await prisma.factura.count({ where });

    res.json({
      facturas,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener factura por ID
export const obtenerFacturaPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const factura = await prisma.factura.findUnique({
      where: { id: Number(id) },
      include: {
        productos: {
          include: {
            producto: true
          }
        },
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            correo: true
          }
        }
      }
    });

    if (!factura) {
      return res.status(404).json({ error: "Factura no encontrada" });
    }

    res.json({ factura });
  } catch (error) {
    console.error("Error al obtener factura:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar factura
export const actualizarFactura = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      codigoFactura, 
      metodoPago, 
      lugarCompra, 
      nitProveedor, 
      fechaHoraCompra, 
      productos 
    } = req.body;

    // Verificar que la factura existe
    const facturaExistente = await prisma.factura.findUnique({
      where: { id: Number(id) }
    });

    if (!facturaExistente) {
      return res.status(404).json({ error: "Factura no encontrada" });
    }

    // Calcular nuevo total
    let totalPagar = 0;
    const productosConPrecio: Array<{
      productoId: number;
      cantidad: number;
      descuento: number;
      precioTotal: number;
    }> = [];

    for (const prod of productos) {
      const producto = await prisma.producto.findUnique({
        where: { codigo: prod.codigo }
      });

      if (!producto) {
        return res.status(404).json({ 
          error: `Producto con código ${prod.codigo} no encontrado` 
        });
      }

      const descuento = prod.descuento || 0;
      const precioConDescuento = Number(producto.precioUnitario) * (1 - descuento / 100);
      const precioTotal = precioConDescuento * prod.cantidad;
      totalPagar += precioTotal;

      productosConPrecio.push({
        productoId: producto.id,
        cantidad: prod.cantidad,
        descuento: descuento,
        precioTotal: precioTotal
      });
    }

    // Actualizar factura usando transacción
    const facturaActualizada = await prisma.$transaction(async (tx) => {
      // Eliminar productos existentes
      await tx.facturaProducto.deleteMany({
        where: { facturaId: Number(id) }
      });

      // Actualizar factura
      const factura = await tx.factura.update({
        where: { id: Number(id) },
        data: {
          codigoFactura,
          metodoPago,
          lugarCompra,
          nitProveedor,
          fechaHoraCompra: new Date(fechaHoraCompra),
          totalPagar,
          productos: {
            create: productosConPrecio
          }
        },
        include: {
          productos: {
            include: {
              producto: true
            }
          },
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            }
          }
        }
      });

      return factura;
    });

    res.json({ 
      message: "Factura actualizada exitosamente", 
      factura: facturaActualizada 
    });
  } catch (error) {
    console.error("Error al actualizar factura:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar factura
export const eliminarFactura = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const factura = await prisma.factura.findUnique({
      where: { id: Number(id) }
    });

    if (!factura) {
      return res.status(404).json({ error: "Factura no encontrada" });
    }

    // Eliminar factura (los productos se eliminan automáticamente por CASCADE)
    await prisma.factura.delete({
      where: { id: Number(id) }
    });

    res.json({ message: "Factura eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar factura:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener estadísticas de gastos
export const obtenerEstadisticas = async (req: Request, res: Response) => {
  try {
    const { usuarioId, fechaInicio, fechaFin } = req.query;

    const where: any = {};
    if (usuarioId) where.usuarioId = Number(usuarioId);
    if (fechaInicio || fechaFin) {
      where.fechaHoraCompra = {};
      if (fechaInicio) where.fechaHoraCompra.gte = new Date(fechaInicio as string);
      if (fechaFin) where.fechaHoraCompra.lte = new Date(fechaFin as string);
    }

    // Total gastado
    const totalGastado = await prisma.factura.aggregate({
      where,
      _sum: {
        totalPagar: true
      }
    });

    // Gasto por método de pago
    const gastoPorMetodo = await prisma.factura.groupBy({
      by: ['metodoPago'],
      where,
      _sum: {
        totalPagar: true
      }
    });

    // Gasto por mes (últimos 12 meses)
    const gastoPorMes = await prisma.factura.groupBy({
      by: ['fechaHoraCompra'],
      where: {
        ...where,
        fechaHoraCompra: {
          gte: new Date(new Date().getFullYear(), 0, 1) // Desde enero del año actual
        }
      },
      _sum: {
        totalPagar: true
      }
    });

    // Lugares más frecuentes
    const lugaresFrecuentes = await prisma.factura.groupBy({
      by: ['lugarCompra'],
      where,
      _count: {
        lugarCompra: true
      },
      orderBy: {
        _count: {
          lugarCompra: 'desc'
        }
      },
      take: 10
    });

    res.json({
      totalGastado: totalGastado._sum.totalPagar || 0,
      gastoPorMetodo,
      gastoPorMes,
      lugaresFrecuentes
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};