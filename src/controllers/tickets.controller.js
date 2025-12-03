// src/controllers/tickets.controller.js
const TicketService = require('../services/ticket.service');
const ticketRepository = require('../repositories/ticket.repository');

// Inicializamos TicketService sólo con el repositorio de tickets.
// El servicio encapsula la lógica de compra y ajuste de capacidad.
const ticketService = new TicketService(ticketRepository);

async function purchaseTicket(req, res, next) {
  try {
    // Delegamos la compra al servicio y pasamos el body y el usuario autenticado.
    const result = await ticketService.purchase(req.body, req.user);
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
