const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase, closePool } = require('../helpers/db');

describe('Auth API - integración', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closePool(); // ahora mismo es no-op
  });

  test('POST /api/auth/register crea usuario y no devuelve password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Julio',
        email: 'julio@example.com',
        password: 'secreto123',
        role: 'admin',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.email).toBe('julio@example.com');
    expect(res.body.role).toBe('ADMIN'); // normalizado a mayúsculas
    expect(res.body.password).toBeUndefined();
  });

  test('POST /api/auth/login devuelve token y usuario', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Julio',
        email: 'julio@example.com',
        password: 'secreto123',
        role: 'user',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'julio@example.com',
        password: 'secreto123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('julio@example.com');
    expect(res.body.user.password).toBeUndefined();
  });
});
