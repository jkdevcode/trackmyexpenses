import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let authCookie: string;
  let userId: number;

  const randomString = Math.random().toString(36).substring(7);
  const testUser = {
    tipoDocumento: 'TI',
    documento: `222${randomString}`,
    nombres: 'User',
    apellidos: 'Test',
    correo: `user${randomString}@example.com`,
    contrasena: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    // Register user to get token and ID
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(testUser);

    // Login to get token
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        documento: testUser.documento,
        contrasena: testUser.contrasena,
      });

    authCookie = loginRes.headers['set-cookie'][0].split(';')[0];
    userId = loginRes.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/users')
      .set('Cookie', authCookie)
      .expect(200)
      .expect((res) => {
        expect(res.body.users).toBeInstanceOf(Array);
        expect(res.body.users.length).toBeGreaterThan(0);
        // Ensure sensitive data is not returned
        expect(res.body.users[0].contrasena).toBeUndefined();
      });
  });

  it('/api/users/:id (GET)', () => {
    return request(app.getHttpServer())
      .get(`/api/users/${userId}`)
      .set('Cookie', authCookie)
      .expect(200)
      .expect((res) => {
        expect(res.body.user.id).toBe(userId);
        expect(res.body.user.correo).toBe(testUser.correo);
        expect(res.body.user.contrasena).toBeUndefined();
      });
  });

  it('/api/users/:id (PATCH)', () => {
    const newName = 'UpdatedName';
    return request(app.getHttpServer())
      .patch(`/api/users/${userId}`)
      .set('Cookie', authCookie)
      .send({
        nombres: newName,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.user.nombres).toBe(newName);
      });
  });

  it('/api/users/:id (DELETE)', () => {
    // Create a dummy user to delete, as we cannot delete key test user which might be needed for other tests if parallel
    // But parallel exec in simple jest file is sequential.
    // We will try to delete the testUser itself at the end.
    return (
      request(app.getHttpServer())
        .delete(`/api/users/${userId}`)
        .set('Cookie', authCookie)
        // .expect(200)
        // Wait, deleteUser checks if id === currentUserId and throws Forbidden
        // "No puedes eliminar tu propia cuenta" (Service logic)
        .expect(403)
    );
  });
});
