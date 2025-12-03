// src/controllers/events.controller.js
const EventService = require('../services/event.service');
const eventRepository = require('../repositories/event.repository');

const eventService = new EventService(eventRepository);

async function createEvent(req, res, next) {
  try {
    const created = await eventService.createEvent(req.body);
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
    const { search, category, page, limit } = req.query;

    const result = await eventService.listEvents({
      search,
      category,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { createEvent, listEvents };
