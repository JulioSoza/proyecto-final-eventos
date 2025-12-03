// tests/integration/app.integration.test.js
const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/db/pool');
const { resetDatabase, closePool } = require('../helpers/db');

describe('Full flow: auth -> events -> tickets', () => {
  const baseUser = {
    name: 'Test Organizer',
    email: 'organizer@test.com',
    password: '123456',
  };

  // BD limpia antes de cada test
  beforeEach(async () => {
    await resetDatabase();
  });

  // Cerramos el pool al terminar TODOS los tests
  afterAll(async () => {
    await closePool();
  });

  test('user can register and login', async () => {
    // 1) Register
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: baseUser.name,
        email: baseUser.email,
        password: baseUser.password,
        role: 'user', // el rol real de ORGANIZER lo daremos con UPDATE
      });

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body).toHaveProperty('id');
    expect(registerRes.body.email).toBe(baseUser.email);

    // 2) Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: baseUser.email,
        password: baseUser.password,
      });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    expect(loginRes.body.user.email).toBe(baseUser.email);
  });

  test('organizer can create event and purchase tickets', async () => {
    // 1) Register user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: baseUser.name,
        email: baseUser.email,
        password: baseUser.password,
        role: 'user',
      });

    // 2) Convertirlo en ORGANIZER directamente en BD
    await pool.query(
      "UPDATE users SET role = 'ORGANIZER' WHERE email = $1",
      [baseUser.email]
    );

    // 3) Login para obtener token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: baseUser.email,
        password: baseUser.password,
      });

    expect(loginRes.statusCode).toBe(200);
    const token = loginRes.body.token;
    expect(token).toBeDefined();

    // 4) Crear evento como ORGANIZER
    const eventPayload = {
      title: 'Evento de prueba para tests',
      description: 'Evento creado desde Jest + Supertest',
      location: 'Ciudad de Guatemala',
      startDate: '2025-12-31T20:00:00.000Z',
      endDate: '2026-01-01T02:00:00.000Z',
      capacity: 50,
      price: 100.5,
      isPublished: true,
    };

    const createEventRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(eventPayload);

    expect(createEventRes.statusCode).toBe(201);
    expect(createEventRes.body).toHaveProperty('id');
    expect(createEventRes.body.title).toBe(eventPayload.title);

    const eventId = createEventRes.body.id;

    // 5) Comprar tickets para ese evento
    const purchaseRes = await request(app)
      .post('/api/tickets/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({
        eventId,
        quantity: 3,
      });

    expect(purchaseRes.statusCode).toBe(201);
    expect(purchaseRes.body).toHaveProperty('ticket');
    expect(purchaseRes.body.ticket.quantity).toBe(3);
    expect(purchaseRes.body.ticket.eventId).toBe(eventId);

    // total = price * quantity
    expect(purchaseRes.body.ticket.total).toBeCloseTo(
      eventPayload.price * 3
    );

    // 6) Verificar que capacity se actualizó en la BD
    const capacityRes = await pool.query(
      'SELECT capacity FROM events WHERE id = $1',
      [eventId]
    );

    expect(capacityRes.rows[0].capacity).toBe(
      eventPayload.capacity - 3
    );
  });

  test('non-organizer cannot create events (403)', async () => {
    // 1) Register normal user (no cambiamos el rol)
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Usuario normal',
        email: 'user@test.com',
        password: '123456',
        role: 'user',
      });

    // 2) Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@test.com',
        password: '123456',
      });

    const token = loginRes.body.token;

    // 3) Intentar crear evento
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Evento que no debería crearse',
        description: 'No autorizado',
        location: 'Ahora',
        startDate: '2025-12-31T20:00:00.000Z',
        capacity: 10,
        price: 10,
        isPublished: false,
      });

    expect(res.statusCode).toBe(403);
  });

  test('protected endpoints require token (401)', async () => {
    const res = await request(app).post('/api/events').send({
      title: 'Evento sin token',
      description: 'No debería pasar',
      location: 'N/A',
      startDate: '2025-12-31T20:00:00.000Z',
      capacity: 10,
      price: 10,
      isPublished: false,
    });

    expect(res.statusCode).toBe(401);
  });
});
