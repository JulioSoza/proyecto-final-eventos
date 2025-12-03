// tests/integration/security.int.test.js
const request = require('supertest');
const app = require('../../src/app');
const jwtLib = require('../../src/utils/jwt');

describe('Seguridad y roles - endpoint protegido', () => {
  test('rechaza sin token con 401', async () => {
    const res = await request(app)
      .get('/api/protected/admin-only');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Missing or invalid token');
  });

  test('rechaza token inválido con 401', async () => {
    const res = await request(app)
      .get('/api/protected/admin-only')
      .set('Authorization', 'Bearer token-invalido');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid token');
  });

  test('rechaza con 403 cuando rol no es admin', async () => {
    const tokenUser = jwtLib.sign({ id: 1, role: 'user' });

    const res = await request(app)
      .get('/api/protected/admin-only')
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Forbidden');
  });

  test('permite acceso a admin con 200', async () => {
    const tokenAdmin = jwtLib.sign({ id: 1, role: 'admin' });

    const res = await request(app)
      .get('/api/protected/admin-only')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Welcome admin');
    expect(res.body.user.role).toBe('admin');
  });
});
