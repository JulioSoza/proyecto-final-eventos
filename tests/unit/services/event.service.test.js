jest.mock('../../../src/repositories/event.repository.js');

const eventRepository = require('../../../src/repositories/event.repository.js');
const EventService = require('../../../src/services/event.service.js');

describe('EventService - Unit Tests', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EventService(eventRepository);
  });

  test('getEventById debe fallar si no existe', async () => {
    eventRepository.getEventById = jest.fn().mockResolvedValue(null);

    await expect(service.getEventById(123))
      .rejects
      .toThrow('Event not found');
  });

  test('getEventById debe devolver el evento', async () => {
    const mockEvent = { id: 3, title: 'Evento Test' };

    eventRepository.getEventById = jest.fn().mockResolvedValue(mockEvent);

    const result = await service.getEventById(3);

    expect(result).toEqual(mockEvent);
  });
});
