import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('FacturaController (e2e)', () => {
  let app: INestApplication;
  let authCookie: string;
  const httpServer = () =>
    app.getHttpServer() as unknown as Parameters<typeof request>[0];

  const uniqueId = Date.now().toString().slice(-8);
  const testUser = {
    tipoDocumento: 'CC',
    documento: `1${uniqueId}`, // 1 + 8 = 9 chars. Fits 6-10.
    nombres: 'Factura',
    apellidos: 'Tester',
    correo: `factura${uniqueId}@example.com`,
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/facturas (POST) - Create Factura', () => {
    return request(httpServer())
      .post('/api/facturas')
      .set('Cookie', authCookie)
      .send({
        fecha: new Date().toISOString(),
        total: 150.0,
        metodoPago: 'EFECTIVO',
        lugarCompra: 'Supermercado Test',
      })
      .expect(201)
      .expect((res) => {
        const body = res.body as {
          factura: { totalPagar: string; codigoFactura: string };
        };
        expect(body.factura).toBeDefined();
        expect(body.factura.totalPagar).toBe('150'); // Decimal returned as string usually
        expect(body.factura.codigoFactura).toBeDefined();
      });
  });

  it('/api/facturas (GET) - List Facturas', () => {
    return request(httpServer())
      .get('/api/facturas')
      .set('Cookie', authCookie)
      .expect(200)
      .expect((res) => {
        const body = res.body as { facturas: Array<{ usuarioId: number }> };
        expect(body.facturas).toBeInstanceOf(Array);
        expect(body.facturas.length).toBeGreaterThan(0);
        expect(body.facturas[0].usuarioId).toBeDefined();
      });
  });

  it('/api/facturas (POST) - Fail Validation', () => {
    return request(httpServer())
      .post('/api/facturas')
      .set('Cookie', authCookie)
      .send({
        fecha: 'invalid-date', // Invalid
        total: -50, // Negative
      })
      .expect(400);
  });
});
