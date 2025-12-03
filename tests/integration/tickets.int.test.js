// tests/integration/tickets.int.test.js
const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/db/pool');
const { resetDatabase, closePool } = require('../helpers/db');

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

async function createUserAndToken(role = 'USER') {
  const email = `${role.toLowerCase()}_${Date.now()}@test.com`;
  const password = '123456';

  // Registramos vía API
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email,
      password,
      role,
    });

  // Login
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return {
    token: login.body.token,
    userId: login.body.user.id,
  };
}

async function promoteTo(role, email) {
  await pool.query(`UPDATE users SET role = $1 WHERE email = $2`, [
    role,
    email,
  ]);
}

async function createOrganizerAndToken() {
  const email = `org_${Date.now()}@test.com`;
  const password = '123456';

  // registrar
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Organizer',
      email,
      password,
      role: 'USER',
    });

  // subirlo a organizer en BD
  await pool.query(
    "UPDATE users SET role = 'ORGANIZER' WHERE email = $1",
    [email]
  );

  // login
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return {
    token: loginRes.body.token,
    userId: loginRes.body.user.id,
  };
}

async function createEvent(token, overrides = {}) {
  const payload = {
    title: 'Evento test compra',
    description: 'Test tickets',
    location: 'Guatemala',
    startDate: '2030-01-01T20:00:00.000Z',
    endDate: '2030-01-02T02:00:00.000Z',
    capacity: 5,
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

// ---------------------------------------------------------------------------
// TEST SUITE
// ---------------------------------------------------------------------------

describe('Tickets API - integración', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closePool();
  });

  // ---------------------------------------------------------------------------
  // 1) Compra exitosa
  // ---------------------------------------------------------------------------
  test('compra ticket (201) crea ticket y reduce capacidad', async () => {
    const { token, userId } = await createOrganizerAndToken();
    const event = await createEvent(token, { capacity: 5, price: 100 });

    const res = await request(app)
      .post('/api/tickets/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({
        eventId: event.id,
        quantity: 2,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.ticket).toBeDefined();
    expect(res.body.ticket.eventId).toBe(event.id);
    expect(res.body.ticket.userId).toBe(userId);
    expect(res.body.ticket.quantity).toBe(2);
    expect(res.body.ticket.total).toBeCloseTo(200);

    const cap = await pool.query(
      'SELECT capacity FROM events WHERE id = $1',
      [event.id]
    );
    expect(cap.rows[0].capacity).toBe(3);
  });

  // ---------------------------------------------------------------------------
  // 2) 401 sin token
  // ---------------------------------------------------------------------------
  test('rechaza compra sin token (401)', async () => {
    const res = await request(app)
      .post('/api/tickets/purchase')
      .send({
        eventId: 1,
        quantity: 1,
      });

    expect(res.statusCode).toBe(401);
  });

  // ---------------------------------------------------------------------------
  // 3) 409 sin capacidad suficiente
  // ---------------------------------------------------------------------------
  test('rechaza compra sin capacidad suficiente (409)', async () => {
    const { token } = await createOrganizerAndToken();
    const event = await createEvent(token, { capacity: 1, price: 50 });

    const res = await request(app)
      .post('/api/tickets/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({
        eventId: event.id,
        quantity: 2,
      });

    expect(res.statusCode).toBe(409);
  });

  // ---------------------------------------------------------------------------
  // 4) 404 evento no existe
  // ---------------------------------------------------------------------------
  test('compra con eventId inexistente devuelve 404', async () => {
    const { token } = await createOrganizerAndToken();

    const res = await request(app)
      .post('/api/tickets/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({
        eventId: 999999,
        quantity: 1,
      });

    expect(res.statusCode).toBe(404);
  });

  // ---------------------------------------------------------------------------
  // 5) quantity inválido → 400
  // ---------------------------------------------------------------------------
  test('rechaza quantity inválido (400)', async () => {
    const { token } = await createOrganizerAndToken();
    const event = await createEvent(token);

    const res = await request(app)
      .post('/api/tickets/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({
        eventId: event.id,
        quantity: 0, // inválido
      });

    expect(res.statusCode).toBe(400);
  });

  // ---------------------------------------------------------------------------
  // 6) GET /api/tickets/my devuelve sólo del usuario autenticado
  // ---------------------------------------------------------------------------
  test('GET /api/tickets/my devuelve los tickets del usuario (200)', async () => {
    const { token, userId } = await createOrganizerAndToken();
    const event = await createEvent(token);

    // compra
    await request(app)
      .post('/api/tickets/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({
        eventId: event.id,
        quantity: 1,
      });

    const res = await request(app)
      .get('/api/tickets/my')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].userId).toBe(userId);
  });

  // ---------------------------------------------------------------------------
  // 7) GET /api/tickets/my sin token → 401
  // ---------------------------------------------------------------------------
  test('GET /api/tickets/my sin token devuelve 401', async () => {
    const res = await request(app).get('/api/tickets/my');
    expect(res.statusCode).toBe(401);
  });
});
