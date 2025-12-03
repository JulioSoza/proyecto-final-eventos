// src/controllers/tickets.controller.js
const TicketService = require('../services/ticket.service');
const ticketRepository = require('../repositories/ticket.repository');
const eventRepository = require('../repositories/event.repository');

const ticketService = new TicketService(ticketRepository, eventRepository);

async function purchaseTicket(req, res, next) {
  try {
    const userId = req.user.id; // viene del token
    const { eventId, quantity } = req.body;

    const result = await ticketService.purchaseTicket({
      userId,
      eventId,
      quantity
    });

    return res.status(201).json(result);
  } catch (err) {
    if (err.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ message: err.message });
    }
    if (err.code === 'NO_CAPACITY') {
      return res.status(409).json({ message: err.message });
    }
    return next(err);
  }
}

module.exports = { purchaseTicket };
