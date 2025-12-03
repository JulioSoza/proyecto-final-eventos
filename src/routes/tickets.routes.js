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
    const payload = jwtLib.verify(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// POST /api/tickets/purchase  -> compra de tickets
router.post('/purchase', requireAuth, async (req, res, next) => {
  try {
    const result = await ticketService.purchase(req.body, req.user);
    // result: { ticket, event }
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/tickets/me  -> tickets del usuario autenticado
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const tickets = await ticketService.listMyTickets(req.user);
    res.json({ items: tickets, count: tickets.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
    