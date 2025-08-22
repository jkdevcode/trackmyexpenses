const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // Crear usuarios de prueba
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const usuarios = await Promise.all([
    prisma.usuario.upsert({
      where: { correo: 'admin@example.com' },
      update: {},
      create: {
        tipoDocumento: 'CC',
        documento: '12345678',
        nombres: 'Admin',
        apellidos: 'Sistema',
        correo: 'admin@example.com',
        contrasena: hashedPassword,
        foto: 'https://via.placeholder.com/150'
      }
    }),
    prisma.usuario.upsert({
      where: { correo: 'juan@example.com' },
      update: {},
      create: {
        tipoDocumento: 'CC',
        documento: '87654321',
        nombres: 'Juan',
        apellidos: 'Pérez',
        correo: 'juan@example.com',
        contrasena: hashedPassword,
        foto: 'https://via.placeholder.com/150'
      }
    }),
    prisma.usuario.upsert({
      where: { correo: 'maria@example.com' },
      update: {},
      create: {
        tipoDocumento: 'CE',
        documento: '98765432',
        nombres: 'María',
        apellidos: 'García',
        correo: 'maria@example.com',
        contrasena: hashedPassword,
        foto: 'https://via.placeholder.com/150'
      }
    })
  ]);

  console.log('✅ Usuarios creados:', usuarios.length);

  // Crear productos de prueba
  const productos = await Promise.all([
    prisma.producto.upsert({
      where: { codigo: 'PROD-001' },
      update: {},
      create: {
        codigo: 'PROD-001',
        nombre: 'Arroz Integral',
        precioUnitario: 25.50
      }
    }),
    prisma.producto.upsert({
      where: { codigo: 'PROD-002' },
      update: {},
      create: {
        codigo: 'PROD-002',
        nombre: 'Leche Deslactosada',
        precioUnitario: 8.75
      }
    }),
    prisma.producto.upsert({
      where: { codigo: 'PROD-003' },
      update: {},
      create: {
        codigo: 'PROD-003',
        nombre: 'Pan Integral',
        precioUnitario: 12.00
      }
    }),
    prisma.producto.upsert({
      where: { codigo: 'PROD-004' },
      update: {},
      create: {
        codigo: 'PROD-004',
        nombre: 'Aceite de Oliva',
        precioUnitario: 45.80
      }
    }),
    prisma.producto.upsert({
      where: { codigo: 'PROD-005' },
      update: {},
      create: {
        codigo: 'PROD-005',
        nombre: 'Huevos Orgánicos',
        precioUnitario: 18.90
      }
    }),
    prisma.producto.upsert({
      where: { codigo: 'PROD-006' },
      update: {},
      create: {
        codigo: 'PROD-006',
        nombre: 'Manzanas Rojas',
        precioUnitario: 15.60
      }
    }),
    prisma.producto.upsert({
      where: { codigo: 'PROD-007' },
      update: {},
      create: {
        codigo: 'PROD-007',
        nombre: 'Pollo Entero',
        precioUnitario: 35.00
      }
    }),
    prisma.producto.upsert({
      where: { codigo: 'PROD-008' },
      update: {},
      create: {
        codigo: 'PROD-008',
        nombre: 'Queso Mozzarella',
        precioUnitario: 28.50
      }
    })
  ]);

  console.log('✅ Productos creados:', productos.length);

  // Crear facturas de prueba
  const facturas = [];
  const lugares = ['Supermercado Central', 'Tienda del Barrio', 'Mercado Campesino', 'Minimarket Express'];
  const metodosPago = ['EFECTIVO', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA'];

  // Generar facturas para los últimos 30 días
  for (let i = 0; i < 20; i++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - Math.floor(Math.random() * 30));
    fecha.setHours(Math.floor(Math.random() * 24));
    fecha.setMinutes(Math.floor(Math.random() * 60));

    const lugarCompra = lugares[Math.floor(Math.random() * lugares.length)];
    const metodoPago = metodosPago[Math.floor(Math.random() * metodosPago.length)];
    const usuarioId = usuarios[Math.floor(Math.random() * usuarios.length)].id;

    // Seleccionar productos aleatorios para esta factura
    const numProductos = Math.floor(Math.random() * 5) + 1; // 1-5 productos
    const productosFactura = [];
    let totalPagar = 0;

    for (let j = 0; j < numProductos; j++) {
      const producto = productos[Math.floor(Math.random() * productos.length)];
      const cantidad = Math.floor(Math.random() * 3) + 1; // 1-3 unidades
      const descuento = Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0; // 30% de probabilidad de descuento
      
      const precioConDescuento = Number(producto.precioUnitario) * (1 - descuento / 100);
      const precioTotal = precioConDescuento * cantidad;
      totalPagar += precioTotal;

      productosFactura.push({
        productoId: producto.id,
        cantidad,
        descuento,
        precioTotal
      });
    }

    const factura = await prisma.factura.create({
      data: {
        codigoFactura: `FAC-${String(i + 1).padStart(3, '0')}-${fecha.getFullYear()}`,
        metodoPago,
        lugarCompra,
        nitProveedor: `${Math.floor(Math.random() * 900000000) + 100000000}-${Math.floor(Math.random() * 9) + 1}`,
        fechaHoraCompra: fecha,
        totalPagar,
        usuarioId,
        productos: {
          create: productosFactura
        }
      }
    });

    facturas.push(factura);
  }

  console.log('✅ Facturas creadas:', facturas.length);

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(`- Usuarios: ${usuarios.length}`);
  console.log(`- Productos: ${productos.length}`);
  console.log(`- Facturas: ${facturas.length}`);
  
  console.log('\n🔑 Credenciales de prueba:');
  console.log('admin@example.com / password123');
  console.log('juan@example.com / password123');
  console.log('maria@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

