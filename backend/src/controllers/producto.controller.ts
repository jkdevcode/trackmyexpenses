import type { Request, Response } from "express";
import { prisma } from "../prisma/prisma.js";
import { Prisma } from "@prisma/client";

// Crear un nuevo producto
export const crearProducto = async (req: Request, res: Response) => {
  try {
    const { codigo, nombre, precioUnitario } = req.body;

    // Validar que el código no exista
    const productoExistente = await prisma.producto.findUnique({
      where: { codigo }
    });

    if (productoExistente) {
      return res.status(400).json({ error: "El código del producto ya existe" });
    }

    const producto = await prisma.producto.create({
      data: {
        codigo,
        nombre,
        precioUnitario: Number(precioUnitario)
      }
    });

    res.status(201).json({ 
      message: "Producto creado exitosamente", 
      producto 
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener todos los productos con filtros
export const obtenerProductos = async (req: Request, res: Response) => {
  try {
    const { 
      codigo, 
      nombre, 
      page = 1, 
      limit = 10 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Construir filtros
    const where: any = {};
    
    if (codigo) where.codigo = { contains: codigo as string };
    if (nombre) where.nombre = { contains: nombre as string };

    const productos = await prisma.producto.findMany({
      where,
      orderBy: {
        nombre: 'asc'
      },
      skip,
      take: Number(limit)
    });

    const total = await prisma.producto.count({ where });

    res.json({
      productos,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener producto por ID
export const obtenerProductoPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const producto = await prisma.producto.findUnique({
      where: { id: Number(id) }
    });

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ producto });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener producto por código
export const obtenerProductoPorCodigo = async (req: Request, res: Response) => {
  try {
    const { codigo } = req.params;

    const producto = await prisma.producto.findUnique({
      where: { codigo: String(codigo) }
    });

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ producto });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar producto
export const actualizarProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { codigo, nombre, precioUnitario } = req.body;

    // Verificar que el producto existe
    const productoExistente = await prisma.producto.findUnique({
      where: { id: Number(id) }
    });

    if (!productoExistente) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Si se está cambiando el código, verificar que no exista
    if (codigo && codigo !== productoExistente.codigo) {
      const codigoExistente = await prisma.producto.findUnique({
        where: { codigo }
      });

      if (codigoExistente) {
        return res.status(400).json({ error: "El código del producto ya existe" });
      }
    }

    const producto = await prisma.producto.update({
      where: { id: Number(id) },
      data: {
        codigo,
        nombre,
        precioUnitario: Number(precioUnitario)
      }
    });

    res.json({ 
      message: "Producto actualizado exitosamente", 
      producto 
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar producto
export const eliminarProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const producto = await prisma.producto.findUnique({
      where: { id: Number(id) }
    });

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Verificar si el producto está siendo usado en alguna factura
    const facturasConProducto = await prisma.facturaProducto.findFirst({
      where: { productoId: Number(id) }
    });

    if (facturasConProducto) {
      return res.status(400).json({ 
        error: "No se puede eliminar el producto porque está siendo usado en facturas" 
      });
    }

    await prisma.producto.delete({
      where: { id: Number(id) }
    });

    res.json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener productos más vendidos
export const obtenerProductosMasVendidos = async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin, limit = 10 } = req.query;

    const where: any = {};
    if (fechaInicio || fechaFin) {
      where.factura = {};
      if (fechaInicio) where.factura.fechaHoraCompra = { gte: new Date(fechaInicio as string) };
      if (fechaFin) where.factura.fechaHoraCompra = { lte: new Date(fechaFin as string) };
    }

    const productosMasVendidos = await prisma.facturaProducto.groupBy({
      by: ['productoId'],
      where,
      _sum: {
        cantidad: true,
        precioTotal: true
      },
      orderBy: {
        _sum: {
          cantidad: 'desc'
        }
      },
      take: Number(limit)
    });

    // Obtener información completa de los productos
    const productosConInfo = await Promise.all(
      productosMasVendidos.map(async (item) => {
        const producto = await prisma.producto.findUnique({
          where: { id: item.productoId }
        });

        return {
          producto,
          cantidadTotal: item._sum.cantidad,
          valorTotal: item._sum.precioTotal
        };
      })
    );

    res.json({ productosMasVendidos: productosConInfo });
  } catch (error) {
    console.error("Error al obtener productos más vendidos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

