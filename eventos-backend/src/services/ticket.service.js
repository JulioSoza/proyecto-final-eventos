// src/services/ticket.service.js

class TicketService {
  constructor(ticketRepository) {
    this.ticketRepository = ticketRepository;
  }

  async purchase(input, currentUser) {
    if (!currentUser) {
      const err = new Error('Authentication required');
      err.code = 'UNAUTHENTICATED';
      throw err;
    }

    const { eventId, quantity } = input;

    if (!eventId || !quantity || Number(quantity) <= 0) {
      const err = new Error('eventId and positive quantity are required');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const result = await this.ticketRepository.purchaseTicket({
      userId: currentUser.id,
      eventId: Number(eventId),
      quantity: Number(quantity),
    });

    return result;
  }

  async listMyTickets(currentUser) {
    if (!currentUser) {
      const err = new Error('Authentication required');
      err.code = 'UNAUTHENTICATED';
      throw err;
    }

    const tickets = await this.ticketRepository.listTicketsByUser(currentUser.id);
    return tickets;
  }
}

module.exports = TicketService;
