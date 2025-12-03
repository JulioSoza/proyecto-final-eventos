const EventService = require('../../../src/services/event.service');
const eventRepository = require('../../../src/repositories/event.repository');

jest.mock('../../../src/repositories/event.repository');

describe('EventService - Unit Tests', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EventService(eventRepository);
  });

  test('getEventById debe fallar si no existe', async () => {
    eventRepository.getById.mockResolvedValue(null);

    await expect(service.getEventById(123))
      .rejects.toThrow('Event not found');
  });

  test('getEventById debe devolver el evento', async () => {
    const mockEvent = { id: 3, title: 'Evento Test' };
    eventRepository.getById.mockResolvedValue(mockEvent);

    const result = await service.getEventById(3);

    expect(result).toEqual(mockEvent);
    expect(eventRepository.getById).toHaveBeenCalledWith(3);
  });
});
