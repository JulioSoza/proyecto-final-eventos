// tests/integration/categories.int.test.js
const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/db/pool');
const { resetDatabase, closePool } = require('../helpers/db');

// Helper para crear usuarios y obtener token
async function createUser(role = 'USER') {
  const email = `${role.toLowerCase()}_${Date.now()}@test.com`;
  const password = '123456';

  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email,
      password,
      role,
    });

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return {
    token: login.body.token,
    userId: login.body.user.id,
    email
  };
}

describe('Categories API - integración', () => {

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closePool();
  });

  // ------------------------------------------
  // 1) GET /api/categories sin categorías
  // ------------------------------------------
  test('GET /api/categories devuelve [] si no hay categorías', async () => {
    const res = await request(app).get('/api/categories');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(0);
  });

  // ------------------------------------------
  // 2) POST /api/categories (ADMIN)
  // ------------------------------------------
  test('POST /api/categories permite crear categoría (ADMIN) → 201', async () => {
    const { token } = await createUser('ADMIN');

    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Conciertos'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Conciertos');
    expect(res.body.slug).toBeDefined();
  });

  // ------------------------------------------
  // 3) POST /api/categories rechaza USER → 403
  // ------------------------------------------
  test('POST /api/categories rechaza USER sin permisos → 403', async () => {
    const { token } = await createUser('USER');

    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Prohibido'
      });

    expect(res.statusCode).toBe(403);
  });

  // ------------------------------------------
  // 4) POST /api/categories requiere name → 400
  // ------------------------------------------
  test('POST /api/categories devuelve 400 si no se envía name', async () => {
    const { token } = await createUser('ADMIN');

    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
  });

  // ------------------------------------------
  // 5) GET /api/categories devuelve categorías creadas
  // ------------------------------------------
  test('GET /api/categories devuelve lista con categorías creadas', async () => {
    const { token } = await createUser('ADMIN');

    await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Teatro' });

    await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Deportes' });

    const res = await request(app).get('/api/categories');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(2);
    expect(res.body.items.map(c => c.name)).toContain('Teatro');
    expect(res.body.items.map(c => c.name)).toContain('Deportes');
  });

});
