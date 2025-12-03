// tests/unit/ticket.service.test.js
const TicketService = require('../../src/services/ticket.service');
const ticketRepository = require('../../src/repositories/ticket.repository');

jest.mock('../../src/repositories/ticket.repository');

describe('TicketService - Unit Tests', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TicketService(ticketRepository);
  });

  test('purchase lanza error si no hay usuario', async () => {
    await expect(service.purchase({ eventId: 1, quantity: 1 }, null))
      .rejects.toThrow('Authentication required');
  });

  test('purchase valida eventId y quantity', async () => {
    await expect(service.purchase({ eventId: null, quantity: 1 }, { id: 1 }))
      .rejects.toThrow('eventId and positive quantity are required');

    await expect(service.purchase({ eventId: 5, quantity: 0 }, { id: 1 }))
      .rejects.toThrow('eventId and positive quantity are required');
  });

  test('purchase delega la creación a repository', async () => {
    ticketRepository.purchaseTicket.mockResolvedValue({
      id: 1,
      eventId: 5,
      userId: 1
    });

    const result = await service.purchase(
      { eventId: 5, quantity: 1 },
      { id: 1 }
    );

    expect(result.id).toBe(1);
    expect(ticketRepository.purchaseTicket).toHaveBeenCalledWith({
      userId: 1,
      eventId: 5,
      quantity: 1
    });
  });
});
