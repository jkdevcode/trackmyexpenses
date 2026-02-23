import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('FacturaProducto Interaction (e2e)', () => {
  let app: INestApplication;
  let authCookie: string;
  let productId: number;
  let facturaId: number;

  const uniqueId = Date.now().toString().slice(-6);
  const testUser = {
    tipoDocumento: 'CC',
    documento: `55${uniqueId}`, // 2+6=8
    nombres: 'Integration',
    apellidos: 'Tester',
    correo: `integ${uniqueId}@example.com`,
    contrasena: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    // Register & Login
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(testUser);
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        documento: testUser.documento,
        contrasena: testUser.contrasena,
      });
    authCookie = loginRes.headers['set-cookie'][0].split(';')[0];

    // Create Product
    const prodRes = await request(app.getHttpServer())
      .post('/api/productos')
      .set('Cookie', authCookie)
      .send({
        codigo: `P-${uniqueId}`,
        nombre: 'Integration Product',
        precioUnitario: 50.0,
      });
    productId = prodRes.body.producto.id;

    // Create Factura
    const factRes = await request(app.getHttpServer())
      .post('/api/facturas')
      .set('Cookie', authCookie)
      .send({
        fecha: new Date().toISOString(),
        total: 100.0, // Initial manually set total
        metodoPago: 'EFECTIVO',
      });
    facturaId = factRes.body.factura.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/facturas/:id/productos - Add Product to Factura', () => {
    return request(app.getHttpServer())
      .post(`/api/facturas/${facturaId}/productos`)
      .set('Cookie', authCookie)
      .send({
        productoId: productId,
        cantidad: 2,
        descuento: 0,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.fp).toBeDefined();
        // Product price 50 * 2 = 100.
        // Initial total 100. New Total should be roughly 200.
        // Note: totalPagar in DB is Decimal. JS Prisma Client returns Decimal or string depending on config.
        // Nest default serializer might default to string.
        const newTotal = parseFloat(res.body.data.updatedFactura.totalPagar);
        expect(newTotal).toBeCloseTo(200.0, 1);
      });
  });
});
