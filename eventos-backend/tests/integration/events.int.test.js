// tests/integration/events.int.test.js
const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/db/pool');
const { resetDatabase, closePool } = require('../helpers/db');

async function createOrganizerAndToken() {
  const email = 'organizer@test.com';
  const password = '123456';

  // registrar usuario
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Organizer',
      email,
      password,
      role: 'user',
    });

  // asignar rol organizer
  await pool.query("UPDATE users SET role = 'ORGANIZER' WHERE email = $1", [
    email,
  ]);

  // login
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return loginRes.body.token;
}

async function createEvent(token, overrides = {}) {
  const payload = {
    title: 'Evento test',
    description: 'Descripción test',
    location: 'Guatemala',
    startDate: '2030-01-01T20:00:00.000Z',
    endDate: '2030-01-02T02:00:00.000Z',
    capacity: 10,
    price: 100,
    isPublished: true,
    ...overrides,
  };

  const res = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${token}`)
    .send(payload);

  return res.body;
}

describe('Events API - integración', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closePool();
  });

  // -------------------------------
  // 1) GET lista sin filtros
  // -------------------------------
  test('GET /api/events devuelve lista (200)', async () => {
    const token = await createOrganizerAndToken();
    await createEvent(token);

    const res = await request(app).get('/api/events');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  // -------------------------------
  // 2) GET /api/events/:id detalle
  // -------------------------------
  test('GET /api/events/:id devuelve 200 correctamente', async () => {
    const token = await createOrganizerAndToken();
    const event = await createEvent(token);

    const res = await request(app).get(`/api/events/${event.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(event.id);
  });

  // -------------------------------
  // 3) ❗ TEST NUEVO → 404 evento no existe
  // -------------------------------
  test('GET /api/events/:id debe responder 404 si el evento no existe', async () => {
    const res = await request(app).get('/api/events/99999');
    expect(res.statusCode).toBe(404);
  });

  // -------------------------------
  // 4) ❗ TEST NUEVO → 401 sin token en POST
  // -------------------------------
  test('POST /api/events debe devolver 401 sin token', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({
        title: 'Evento',
        description: 'desc',
        location: 'GT',
        startDate: '2030-01-01',
        capacity: 5,
        price: 20,
      });

    expect(res.statusCode).toBe(401);
  });

  // -------------------------------
  // 5) ❗ TEST NUEVO → 403 user normal intenta crear evento
  // -------------------------------
  test('POST /api/events debe rechazar user normal con 403', async () => {
    // registrar user normal
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User',
        email: 'user@test.com',
        password: '123456',
        role: 'user',
      });

    // login user normal
    const login = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@test.com',
        password: '123456',
      });

    const token = login.body.token;

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'No permitido',
        description: 'desc',
        location: 'GT',
        startDate: '2030-01-01',
        capacity: 5,
        price: 10,
      });

    expect(res.statusCode).toBe(403);
  });

  // -------------------------------
  // 6) PUT update ok
  // -------------------------------
  test('PUT /api/events/:id actualiza evento (200)', async () => {
    const token = await createOrganizerAndToken();
    const event = await createEvent(token);

    const res = await request(app)
      .put(`/api/events/${event.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Nuevo título',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Nuevo título');
  });

  // -------------------------------
  // 7) DELETE evento ok
  // -------------------------------
  test('DELETE /api/events/:id elimina evento (204)', async () => {
    const token = await createOrganizerAndToken();
    const event = await createEvent(token);

    const res = await request(app)
      .delete(`/api/events/${event.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
  });
});
