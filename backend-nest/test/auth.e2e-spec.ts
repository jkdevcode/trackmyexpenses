import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Note: These tests run against the ACTUAL database if connected.
  // Ideally, use a test DB. For now, assuming dev DB is safe or using rollback transaction logic which is complex in e2e.
  // We will test Login primarily to avoid polluting DB with registrations, or register a random user.

  // Documento must be 6-10 chars.
  // Date.now() is 13 chars. substring(-8) is 8 chars.
  const uniqueId = Date.now().toString().slice(-8);
  const testUser = {
    tipoDocumento: 'CC',
    documento: uniqueId,
    nombres: 'Test',
    apellidos: 'User',
    correo: `test${uniqueId}@example.com`,
    contrasena: 'password123',
    foto: 'https://example.com/photo.jpg',
  };

  it('/api/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.status).toBe(200);
      });
  });

  it('/api/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        documento: testUser.documento,
        contrasena: testUser.contrasena,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.token).toBeUndefined();
        expect(res.body.user).toBeDefined();
        expect(res.body.user.documento).toBe(testUser.documento);
        expect(res.headers['set-cookie']).toBeDefined();
        expect(res.headers['set-cookie'][0]).toContain('token=');
      });
  });

  it('/api/auth/login (POST) - Fail Invalid Creds', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        documento: testUser.documento,
        contrasena: 'wrongpassword',
      })
      .expect(401);
  });
});
