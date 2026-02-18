import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('ProductoController (e2e)', () => {
  let app: INestApplication;
  let authCookie: string;

  const uniqueId = Date.now().toString().slice(-6);
  const testUser = {
    tipoDocumento: 'CC',
    documento: `44${uniqueId}`, // 2+6=8 chars
    nombres: 'Producto',
    apellidos: 'Tester',
    correo: `prod${uniqueId}@example.com`,
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
    await request(app.getHttpServer()).post('/api/auth/register').send(testUser);
    const loginRes = await request(app.getHttpServer()).post('/api/auth/login').send({
      documento: testUser.documento,
      contrasena: testUser.contrasena,
    });
    authCookie = loginRes.headers['set-cookie'][0].split(';')[0];
  });

  afterAll(async () => {
    await app.close();
  });

  const testProduct = {
    codigo: `PROD-${uniqueId}`,
    nombre: 'Producto Test',
    precioUnitario: 100.50
  };

  it('/api/productos (POST) - Create Producto', () => {
    return request(app.getHttpServer())
      .post('/api/productos')
      .set('Cookie', authCookie)
      .send(testProduct)
      .expect(201)
      .expect((res) => {
        expect(res.body.producto).toBeDefined();
        expect(res.body.producto.codigo).toBe(testProduct.codigo);
      });
  });

  it('/api/productos (GET) - List Productos', () => {
    return request(app.getHttpServer())
      .get('/api/productos')
      .set('Cookie', authCookie)
      .expect(200)
      .expect((res) => {
        expect(res.body.productos).toBeInstanceOf(Array);
        expect(res.body.productos.length).toBeGreaterThan(0);
      });
  });

  it('/api/productos (POST) - Fail Duplicate Code', () => {
    return request(app.getHttpServer())
      .post('/api/productos')
      .set('Cookie', authCookie)
      .send(testProduct)
      .expect(409);
  });
});
