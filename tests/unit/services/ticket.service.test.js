// tests/unit/services/ticket.service.test.js
const TicketService = require('../../../src/services/ticket.service');

describe('TicketService - Unit Tests', () => {
  let mockRepo;
  let service;

  beforeEach(() => {
    mockRepo = {
      purchaseTicket: jest.fn(),
      listTicketsByUser: jest.fn(),
    };

    service = new TicketService(mockRepo);
  });

  // -------------------------------------------------------
  // PURCHASE
  // -------------------------------------------------------
  describe('purchase', () => {
    const user = { id: 1, role: 'USER' };

    test('should throw UNAUTHENTICATED when no user', async () => {
      await expect(service.purchase({ eventId: 1, quantity: 1 }, null))
        .rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    });

    test('should throw VALIDATION_ERROR when eventId or quantity are missing', async () => {
      await expect(service.purchase({}, user))
        .rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    });

    test('should throw VALIDATION_ERROR when quantity <= 0', async () => {
      await expect(service.purchase({ eventId: 1, quantity: 0 }, user))
        .rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    });

    test('should call repository and return result on success', async () => {
      const mockResult = {
        ticket: { id: 10, eventId: 1, userId: user.id },
        event: { id: 1, title: 'Test Event' },
      };

      mockRepo.purchaseTicket.mockResolvedValue(mockResult);

      const result = await service.purchase({ eventId: 1, quantity: 2 }, user);

      expect(mockRepo.purchaseTicket).toHaveBeenCalledWith({
        userId: user.id,
        eventId: 1,
        quantity: 2,
      });

      expect(result).toEqual(mockResult);
    });
  });

  // -------------------------------------------------------
  // LIST MY TICKETS
  // -------------------------------------------------------
  describe('listMyTickets', () => {
    const user = { id: 99, role: 'USER' };

    test('should throw UNAUTHENTICATED if no user', async () => {
      await expect(service.listMyTickets(null))
        .rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    });

    test('should return tickets for valid user', async () => {
      const mockTickets = [
        { id: 1, eventId: 10 },
        { id: 2, eventId: 11 },
      ];

      mockRepo.listTicketsByUser.mockResolvedValue(mockTickets);

      const result = await service.listMyTickets(user);

      expect(mockRepo.listTicketsByUser).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(mockTickets);
    });
  });
});
