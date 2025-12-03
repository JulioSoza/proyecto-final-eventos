const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/db/pool');
const { resetDatabase, closePool } = require('../helpers/db');

async function createOrganizerAndToken() {
  const email = 'organizer@test.com';
  const password = '123456';

  // 1) Registrar usuario
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Organizer',
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

describe('Events API - integración', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closePool();
  });

  test('POST /api/events crea evento con rol organizer y responde 201', async () => {
    const { token } = await createOrganizerAndToken();

    const payload = {
      title: 'Concierto de prueba',
      description: 'Evento demo con Postgres y testing',
      location: 'Ciudad de Guatemala',
      startDate: '2030-01-01T20:00:00.000Z',
      endDate: '2030-01-02T02:00:00.000Z',
      capacity: 100,
      price: 250.5,
      isPublished: true,
    };

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe(payload.title);
  });

  test('POST /api/events sin token devuelve 401', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({
        title: 'Evento sin token',
        description: 'No debería crearse',
        location: 'Nowhere',
        startDate: '2030-01-01T20:00:00.000Z',
        capacity: 10,
        price: 10,
        isPublished: false,
      });

    expect(res.statusCode).toBe(401);
  });

  test('GET /api/events devuelve una lista que contiene el evento creado', async () => {
    const { token } = await createOrganizerAndToken();

    const payload = {
      title: 'Concierto para listar',
      description: 'Debe aparecer en el listado',
      location: 'Ciudad de Guatemala',
      startDate: '2030-01-01T20:00:00.000Z',
      endDate: '2030-01-02T02:00:00.000Z',
      capacity: 50,
      price: 100,
      isPublished: true,
    };

    const createRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(createRes.statusCode).toBe(201);

    const listRes = await request(app).get('/api/events');

    expect(listRes.statusCode).toBe(200);
    // Para no depender del formato exacto de la respuesta,
    // sólo validamos que el título esté en el JSON.
    expect(JSON.stringify(listRes.body)).toContain(payload.title);
  });
});
