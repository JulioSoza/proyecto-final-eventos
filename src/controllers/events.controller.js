// src/controllers/events.controller.js
const EventService = require('../services/event.service');
const eventRepository = require('../repositories/event.repository');

const eventService = new EventService(eventRepository);

async function createEvent(req, res, next) {
  try {
    // Pasamos el usuario autenticado al servicio para que valide roles y ownership
    const created = await eventService.createEvent(req.body, req.user);
    return res.status(201).json(created);
  } catch (err) {
    if (err.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ message: err.message });
    }
    return next(err);
  }
}

async function listEvents(req, res, next) {
  try {
    // Normalizamos nombres de parámetros de consulta
    const { search, category, page, limit, pageSize, categoryId } = req.query;

    const result = await eventService.listEvents({
      search,
      // preferimos categoryId explícito, de lo contrario usamos category
      categoryId: categoryId || category,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : (limit ? Number(limit) : undefined),
    });

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { createEvent, listEvents };
