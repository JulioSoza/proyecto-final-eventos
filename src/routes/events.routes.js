// src/routes/events.routes.js
const express = require('express');
const EventService = require('../services/event.service');
const eventRepository = require('../repositories/event.repository');
const jwtLib = require('../utils/jwt');
const { uploadEventImage } = require('../middlewares/upload.middleware');
const { pool } = require('../db/pool');

const router = express.Router();
const eventService = new EventService(eventRepository);

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.split(' ')[1];
}

function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  try {
    const payload = jwtLib.verify(token); // { id, role, ... }
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireOrganizerOrAdmin(req, res, next) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const role = (user.role || '').toUpperCase();
  if (!['ORGANIZER', 'ADMIN'].includes(role)) {
    return res.status(403).json({ error: 'Forbidden: organizer or admin only' });
  }
  next();
}

// GET /api/events -> lista con filtros y paginación
router.get('/', async (req, res, next) => {
  try {
    const result = await eventService.listEvents(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/events/:id -> detalle
router.get('/:id', async (req, res, next) => {
  try {
    const event = await eventService.getEventById(Number(req.params.id));
    res.json(event);
  } catch (err) {
    next(err);
  }
});

// POST /api/events -> crear evento (organizer/admin)
router.post('/', requireAuth, requireOrganizerOrAdmin, async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body, req.user);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
});

// PUT /api/events/:id -> actualizar
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(
      Number(req.params.id),
      req.body,
      req.user
    );
    res.json(event);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/events/:id -> eliminar
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await eventService.deleteEvent(Number(req.params.id), req.user);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /api/events/:id/image -> subir imagen de evento (organizer/admin)
router.post(
  '/:id/image',
  requireAuth,
  requireOrganizerOrAdmin,
  uploadEventImage.single('image'),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: 'Image file is required' });
      }

      const imageUrl = `/uploads/events/${req.file.filename}`;

      // Actualizar en la BD
      const { rows } = await pool.query(
        `
        UPDATE events
        SET image_url = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
        `,
        [imageUrl, id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const row = rows[0];

      // Mapeo consistente con event.repository
      return res.status(200).json({
        id: row.id,
        title: row.title,
        description: row.description,
        date: row.date,
        location: row.location,
        price: row.price,
        capacity: row.capacity,
        remainingCapacity: row.remaining_capacity,
        categoryId: row.category_id,
        organizerId: row.organizer_id,
        imageUrl: row.image_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
