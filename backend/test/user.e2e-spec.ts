import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let authCookie: string;
  let userId: number;
  const httpServer = () =>
    app.getHttpServer() as unknown as Parameters<typeof request>[0];

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
    await request(httpServer()).post('/api/auth/register').send(testUser);

    // Login to get token
    const loginRes = await request(httpServer()).post('/api/auth/login').send({
      documento: testUser.documento,
      contrasena: testUser.contrasena,
    });

    authCookie = loginRes.headers['set-cookie'][0].split(';')[0];
    const loginBody = loginRes.body as { user: { id: number } };
    userId = loginBody.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/users (GET)', () => {
    return request(httpServer())
      .get('/api/users')
      .set('Cookie', authCookie)
      .expect(403)
      .expect((res) => {
        const body = res.body as { error?: { code?: string } };
        expect(body.error?.code).toBe('FORBIDDEN');
      });
  });

  it('/api/users/me (GET)', () => {
    return request(httpServer())
      .get('/api/users/me')
      .set('Cookie', authCookie)
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          user: { id: number; correo: string; contrasena?: string };
        };
        expect(body.user.id).toBe(userId);
        expect(body.user.correo).toBe(testUser.correo);
        expect(body.user.contrasena).toBeUndefined();
      });
  });

  it('/api/users/:id (GET)', () => {
    return request(httpServer())
      .get(`/api/users/${userId}`)
      .set('Cookie', authCookie)
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          user: { id: number; correo: string; contrasena?: string };
        };
        expect(body.user.id).toBe(userId);
        expect(body.user.correo).toBe(testUser.correo);
        expect(body.user.contrasena).toBeUndefined();
      });
  });

  it('/api/users/:id (PATCH)', () => {
    const newName = 'UpdatedName';
    return request(httpServer())
      .patch(`/api/users/${userId}`)
      .set('Cookie', authCookie)
      .send({
        nombres: newName,
      })
      .expect(200)
      .expect((res) => {
        const body = res.body as { user: { nombres: string } };
        expect(body.user.nombres).toBe(newName);
      });
  });

  it('/api/users/:id (DELETE)', () => {
    // Create a dummy user to delete, as we cannot delete key test user which might be needed for other tests if parallel
    // But parallel exec in simple jest file is sequential.
    // We will try to delete the testUser itself at the end.
    return (
      request(httpServer())
        .delete(`/api/users/${userId}`)
        .set('Cookie', authCookie)
        // .expect(200)
        // Wait, deleteUser checks if id === currentUserId and throws Forbidden
        // "No puedes eliminar tu propia cuenta" (Service logic)
        .expect(403)
    );
  });
});
