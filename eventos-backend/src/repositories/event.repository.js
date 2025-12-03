// src/repositories/event.repository.js
const { pool } = require('../db/pool');

function mapEvent(row) {
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    startDate: row.start_date,
    endDate: row.end_date,
    capacity: row.capacity,
    price: Number(row.price),
    imageUrl: row.image_url,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    categoryId: row.category_id,
    organizerId: row.organizer_id,
  };
}

async function createEvent(data) {
  const {
    title,
    description,
    location,
    startDate,
    endDate,
    capacity,
    price,
    imageUrl,
    isPublished,
    categoryId,
    organizerId,
  } = data;

  const res = await pool.query(
    `
    INSERT INTO events (
      title,
      description,
      location,
      start_date,
      end_date,
      capacity,
      price,
      image_url,
      is_published,
      category_id,
      organizer_id
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *
  `,
    [
      title,
      description,
      location,
      startDate,
      endDate || null,
      capacity,
      price,
      imageUrl || null,
      isPublished,
      categoryId || null,
      organizerId,
    ]
  );

  return mapEvent(res.rows[0]);
}

async function getEventById(id) {
  const res = await pool.query(
    'SELECT * FROM events WHERE id = $1',
    [id]
  );
  return mapEvent(res.rows[0]);
}

// Lista de eventos con filtros y paginación
async function listEvents({ search, categoryId, page = 1, pageSize = 10 } = {}) {
  const params = [];
  const where = [];

  // Por defecto, solo eventos publicados
  where.push('is_published = TRUE');

  if (search) {
    params.push(`%${search}%`);
    where.push(
      `(title ILIKE $${params.length} OR description ILIKE $${params.length})`
    );
  }

  if (categoryId) {
    params.push(categoryId);
    where.push(`category_id = $${params.length}`);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const pageNum = Number(page) || 1;
  const sizeNum = Number(pageSize) || 10;
  const offset = (pageNum - 1) * sizeNum;

  // total
  const countRes = await pool.query(
    `SELECT COUNT(*) AS total FROM events ${whereClause}`,
    params
  );
  const total = Number(countRes.rows[0].total);

  // datos
  params.push(sizeNum);
  params.push(offset);

  const dataRes = await pool.query(
    `
    SELECT *
    FROM events
    ${whereClause}
    ORDER BY start_date ASC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `,
    params
  );

  const items = dataRes.rows.map(mapEvent);

  return {
    items,
    total,
    page: pageNum,
    pageSize: sizeNum,
    totalPages: Math.ceil(total / sizeNum) || 1,
  };
}

async function updateEvent(id, data) {
  const fields = [];
  const params = [];
  let idx = 1;

  const mapping = {
    title: 'title',
    description: 'description',
    location: 'location',
    startDate: 'start_date',
    endDate: 'end_date',
    capacity: 'capacity',
    price: 'price',
    imageUrl: 'image_url',
    isPublished: 'is_published',
    categoryId: 'category_id',
  };

  for (const [key, column] of Object.entries(mapping)) {
    if (data[key] !== undefined) {
      fields.push(`${column} = $${idx++}`);
      params.push(data[key]);
    }
  }

  if (!fields.length) {
    const existing = await getEventById(id);
    return existing;
  }

  params.push(id);

  const res = await pool.query(
    `
    UPDATE events
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE id = $${idx}
    RETURNING *
  `,
    params
  );

  return mapEvent(res.rows[0]);
}

async function deleteEvent(id) {
  await pool.query('DELETE FROM events WHERE id = $1', [id]);
}

module.exports = {
  createEvent,
  getEventById,
  listEvents,
  updateEvent,
  deleteEvent,
};
