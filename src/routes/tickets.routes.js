// src/routes/tickets.routes.js
const express = require('express');
const TicketService = require('../services/ticket.service');
const ticketRepository = require('../repositories/ticket.repository');
const requireAuth = require('../middlewares/auth.middleware'); // Importación corregida

const router = express.Router();

// Instanciamos la clase TicketService
const ticketService = new TicketService(ticketRepository);

// POST /api/tickets/purchase -> comprar ticket
router.post('/purchase', requireAuth, async (req, res, next) => {
  try {
    const { eventId, quantity } = req.body;
    const result = await ticketService.purchase(
      { eventId, quantity: quantity ?? 1 },
      req.user
    );
    // Devuelve lo que define tu servicio (p. ej. ticket + mensaje)
    res.status(201).json(result);
  } catch (err) {
    // Ajusta los códigos según tu servicio
    if (err.code === 'NO_CAPACITY') {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
});

// GET /api/tickets/my -> tickets del usuario autenticado
router.get('/my', requireAuth, async (req, res, next) => {
  try {
    const tickets = await ticketService.listMyTickets(req.user);
    res.json({ items: tickets });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
