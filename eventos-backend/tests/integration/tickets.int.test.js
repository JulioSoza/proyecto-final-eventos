// tests/integration/tickets.int.test.js
const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/db/pool');
const { resetDatabase, closePool } = require('../helpers/db');

async function createOrganizerAndToken() {
  const email = 'buyer@test.com';
  const password = '123456';

  // 1) Registrar usuario
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Buyer',
      email,
      password,
      role: 'user',
    });

  // 2) Subirlo a ORGANIZER en BD
  await pool.query("UPDATE users SET role = 'ORGANIZER' WHERE email = $1", [
    email,
  ]);

  // 3) Login para obtener token
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
    title: 'Evento para tickets',
    description: 'Test de tickets',
    location: 'Ciudad de Guatemala',
    startDate: '2030-01-01T20:00:00.000Z',
    endDate: '2030-01-02T02:00:00.000Z',
    capacity: 2,
    price: 250.5,
    isPublished: true,
    ...overrides,
  };

  const res = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${token}`)
    .send(payload);

  return res.body;
}

describe('Tickets API - integración', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closePool();
  });

  test('compra ticket (201) crea ticket y reduce capacidad del evento', async () => {
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
    expect(res.body.ticket.quantity).toBe(2);
    expect(res.body.ticket.eventId).toBe(event.id);
    expect(res.body.ticket.userId).toBe(userId);
    expect(res.body.ticket.total).toBeCloseTo(200); // 100 * 2

    const capacityRes = await pool.query(
      'SELECT capacity FROM events WHERE id = $1',
      [event.id]
    );
    expect(capacityRes.rows[0].capacity).toBe(3);
  });

  test('rechaza compra sin token con 401', async () => {
    const res = await request(app)
      .post('/api/tickets/purchase')
      .send({
        eventId: 999,
        quantity: 1,
      });

    expect(res.statusCode).toBe(401);
  });

  test('rechaza compra cuando no hay capacidad suficiente con 409', async () => {
    const { token } = await createOrganizerAndToken();
    const event = await createEvent(token, { capacity: 1, price: 50 });

    const res = await request(app)
      .post('/api/tickets/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({
        eventId: event.id,
        quantity: 2, // más de la capacidad
      });

    expect(res.statusCode).toBe(409);
  });
});
