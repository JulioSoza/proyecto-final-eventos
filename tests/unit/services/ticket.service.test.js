const TicketService = require('../../../src/services/ticket.service');
const ticketRepository = require('../../../src/repositories/ticket.repository');

jest.mock('../../../src/repositories/ticket.repository');

describe('TicketService - Unit Tests', () => {
  let service;
  const mockUser = { id: 10, role: 'USER' };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TicketService(ticketRepository);
  });

  test('purchase debe fallar si faltan parámetros', async () => {
    await expect(service.purchase({}, mockUser))
      .rejects.toThrow('eventId and positive quantity are required');
  });

  test('purchase delega correctamente al repositorio', async () => {
    ticketRepository.purchaseTicket.mockResolvedValue({
      id: 1,
      eventId: 2,
      userId: 10,
      quantity: 1
    });

    const result = await service.purchase(
      { eventId: 2, quantity: 1 },
      mockUser
    );

    expect(result.id).toBe(1);
    expect(ticketRepository.purchaseTicket).toHaveBeenCalled();
  });
});
