const EventService = require('../../../src/services/event.service');

describe('EventService.createEvent', () => {
  let eventRepository;
  let service;
  const organizer = { id: 1, role: 'ORGANIZER' };

  const validPayload = {
    title: 'Mi evento',
    description: 'Desc de prueba',
    location: 'Ciudad de Guatemala',
    startDate: '2030-01-01T10:00:00.000Z',
    endDate: '2030-01-01T12:00:00.000Z',
    capacity: 10,
    price: 100.5,
    isPublished: true,
  };

  beforeEach(() => {
    eventRepository = {
      createEvent: jest.fn().mockResolvedValue({
        id: 1,
        ...validPayload,
        organizerId: organizer.id,
      }),
    };

    service = new EventService(eventRepository);
  });

  test('lanza error si no hay usuario autenticado', async () => {
    await expect(service.createEvent(validPayload, null))
      .rejects
      .toThrow('Authentication required');
  });

  test('crea un evento válido', async () => {
    const result = await service.createEvent(validPayload, organizer);

    expect(eventRepository.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: validPayload.title,
        description: validPayload.description,
        location: validPayload.location,
        startDate: validPayload.startDate,
        endDate: validPayload.endDate,
        capacity: validPayload.capacity,
        price: validPayload.price,
        isPublished: validPayload.isPublished,
        organizerId: organizer.id,
      })
    );

    expect(result.id).toBe(1);
    expect(result.title).toBe(validPayload.title);
  });

  test('lanza error si faltan campos requeridos', async () => {
    const bad = { title: 'Incompleto' };

    await expect(service.createEvent(bad, organizer))
      .rejects
      .toThrow('Missing required event fields');
  });

  test('lanza error si la capacidad es menor o igual a 0', async () => {
    const bad = { ...validPayload, capacity: 0 };

    await expect(service.createEvent(bad, organizer))
      .rejects
      .toThrow('Capacity must be greater than zero');
  });
});
