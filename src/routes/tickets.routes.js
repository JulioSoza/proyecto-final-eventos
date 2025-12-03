// src/routes/tickets.routes.js
const express = require('express');
const TicketService = require('../services/ticket.service');
const ticketRepository = require('../repositories/ticket.repository');
const jwtLib = require('../utils/jwt');

const router = express.Router();
const ticketService = new TicketService(ticketRepository);

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

// POST /api/tickets  -> compra de ticket
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { eventId, quantity } = req.body;
    const userId = req.user.id;

    const ticket = await ticketService.buyTicket({
      eventId,
      userId,
      quantity: quantity || 1,
    });

    return res.status(201).json(ticket);
  } catch (err) {
    if (err.code === 'NO_CAPACITY') {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
});

module.exports = router;
