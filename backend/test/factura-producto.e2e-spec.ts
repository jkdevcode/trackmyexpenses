import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('FacturaProducto Interaction (e2e)', () => {
  let app: INestApplication;
  let authCookie: string;
  let baseProductId: number;
  let productToAddId: number;
  let facturaId: number;
  const httpServer = () =>
    app.getHttpServer() as unknown as Parameters<typeof request>[0];

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
    await request(httpServer()).post('/api/auth/register').send(testUser);
    const loginRes = await request(httpServer()).post('/api/auth/login').send({
      documento: testUser.documento,
      contrasena: testUser.contrasena,
    });
    authCookie = loginRes.headers['set-cookie'][0].split(';')[0];

    // Create base product (used in initial factura items)
    const baseProdRes = await request(httpServer())
      .post('/api/productos')
      .set('Cookie', authCookie)
      .send({
        codigo: `P-BASE-${uniqueId}`,
        nombre: 'Integration Base Product',
        precioUnitario: 50.0,
      });
    const baseProductBody = baseProdRes.body as { producto: { id: number } };
    baseProductId = baseProductBody.producto.id;

    // Create second product (used for add-product endpoint)
    const addProdRes = await request(httpServer())
      .post('/api/productos')
      .set('Cookie', authCookie)
      .send({
        codigo: `P-ADD-${uniqueId}`,
        nombre: 'Integration Product To Add',
        precioUnitario: 50.0,
      });
    const addProductBody = addProdRes.body as { producto: { id: number } };
    productToAddId = addProductBody.producto.id;

    // Create Factura
    const factRes = await request(httpServer())
      .post('/api/facturas')
      .set('Cookie', authCookie)
      .send({
        metodoPago: 'EFECTIVO',
        lugarCompra: 'SUPERMERCADO E2E',
        fechaHoraCompra: new Date().toISOString(),
        items: [
          {
            productoId: baseProductId,
            cantidad: 1,
            descuento: 0,
          },
        ],
      });
    const facturaBody = factRes.body as { factura: { id: number } };
    facturaId = facturaBody.factura.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/facturas/:id/productos - Add Product to Factura', () => {
    return request(httpServer())
      .post(`/api/facturas/${facturaId}/productos`)
      .set('Cookie', authCookie)
      .send({
        productoId: productToAddId,
        cantidad: 2,
        descuento: 0,
      })
      .expect(201)
      .expect((res) => {
        const body = res.body as {
          data: { fp: unknown; updatedFactura: { totalPagar: string } };
        };
        expect(body.data.fp).toBeDefined();
        // Base item: 50 * 1 = 50
        // Added item: 50 * 2 = 100
        // New total should be roughly 150.
        // Note: totalPagar in DB is Decimal. JS Prisma Client returns Decimal or string depending on config.
        // Nest default serializer might default to string.
        const newTotal = parseFloat(body.data.updatedFactura.totalPagar);
        expect(newTotal).toBeCloseTo(150.0, 1);
      });
  });
});
