// tests/unit/events.service.test.js
const EventsService = require('../../src/services/events.service');
const eventsRepository = require('../../src/repositories/events.repository');

jest.mock('../../src/repositories/events.repository');

describe('EventsService - Unit Tests', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EventsService(eventsRepository);
  });

  test('createEvent guarda evento correctamente', async () => {
    eventsRepository.createEvent.mockResolvedValue({ id: 1, title: 'Prueba' });

    const result = await service.createEvent({
      title: 'Prueba'
    });

    expect(result.id).toBe(1);
    expect(eventsRepository.createEvent).toHaveBeenCalled();
  });

  test('getEventById devuelve evento existente', async () => {
    eventsRepository.getEventById.mockResolvedValue({
      id: 10,
      title: 'Evento 10'
    });

    const result = await service.getEventById(10);

    expect(result.id).toBe(10);
  });

  test('getEventById lanza error si no existe', async () => {
    eventsRepository.getEventById.mockResolvedValue(null);

    await expect(service.getEventById(1))
      .rejects.toThrow('Event not found');
  });
});
