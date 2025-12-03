// src/repositories/ticket.repository.js
const { pool } = require('../db/pool');

function mapTicket(row) {
  if (!row) return null;

  return {
    id: row.id,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    total: Number(row.total),
    userId: row.user_id,
    eventId: row.event_id,
    createdAt: row.created_at,
  };
}

// Compra de ticket con transacción:
// - bloquea el evento
// - valida capacidad
// - inserta ticket
// - reduce capacity del evento
async function purchaseTicket({ userId, eventId, quantity }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1) Obtenemos el evento y bloqueamos la fila
    const eventRes = await client.query(
      `
      SELECT id, title, capacity, price
      FROM events
      WHERE id = $1
      FOR UPDATE
      `,
      [eventId]
    );

    if (!eventRes.rows.length) {
      const err = new Error('Event not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    const event = eventRes.rows[0];

    if (event.capacity < quantity) {
      const err = new Error('Not enough capacity for this event');
      err.code = 'NOT_ENOUGH_CAPACITY';
      throw err;
    }

    const unitPrice = Number(event.price);
    const total = unitPrice * quantity;

    // 2) Insertamos el ticket
    const ticketRes = await client.query(
      `
      INSERT INTO tickets (quantity, unit_price, total, user_id, event_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, quantity, unit_price, total, user_id, event_id, created_at
      `,
      [quantity, unitPrice, total, userId, eventId]
    );

    const ticket = mapTicket(ticketRes.rows[0]);

    // 3) Reducimos capacidad
    const eventUpdateRes = await client.query(
      `
      UPDATE events
      SET capacity = capacity - $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING id, title, capacity, price
      `,
      [quantity, eventId]
    );

    const updatedEvent = eventUpdateRes.rows[0];

    await client.query('COMMIT');

    return { ticket, event: updatedEvent };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Listar tickets de un usuario
async function listTicketsByUser(userId) {
  const res = await pool.query(
    `
    SELECT
      t.id,
      t.quantity,
      t.unit_price,
      t.total,
      t.user_id,
      t.event_id,
      t.created_at,
      e.title AS event_title,
      e.start_date AS event_start_date,
      e.location AS event_location
    FROM tickets t
    JOIN events e ON e.id = t.event_id
    WHERE t.user_id = $1
    ORDER BY t.created_at DESC
    `,
    [userId]
  );

  return res.rows.map((row) => ({
    ...mapTicket(row),
    eventTitle: row.event_title,
    eventStartDate: row.event_start_date,
    eventLocation: row.event_location,
  }));
}

module.exports = {
  purchaseTicket,
  listTicketsByUser,
};
