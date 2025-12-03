const EventService = require('../../../src/services/event.service');

describe('EventService - Unit Tests', () => {
  let mockRepo;
  let service;

  beforeEach(() => {
    mockRepo = {
      createEvent: jest.fn(),
      listEvents: jest.fn(),
      getEventById: jest.fn(),
      updateEvent: jest.fn(),
      deleteEvent: jest.fn(),
    };

    service = new EventService(mockRepo);
  });

  // -------------------------------------------------------
  // CREATE EVENT
  // -------------------------------------------------------
  describe('createEvent', () => {
    const validInput = {
      title: 'Test Event',
      description: 'Desc',
      location: 'Guatemala',
      startDate: '2025-01-01',
      capacity: 50,
      price: 100,
    };

    const organizer = { id: 1, role: 'ORGANIZER' };
    const admin = { id: 2, role: 'ADMIN' };

    test('should throw UNAUTHENTICATED when no currentUser', async () => {
      await expect(service.createEvent(validInput, null))
        .rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    });

    test('should throw FORBIDDEN when role is USER', async () => {
      await expect(
        service.createEvent(validInput, { id: 10, role: 'USER' })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    test('should throw VALIDATION_ERROR when required fields are missing', async () => {
      await expect(
        service.createEvent({}, organizer)
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    });

    test('should throw VALIDATION_ERROR when capacity <= 0', async () => {
      const bad = { ...validInput, capacity: 0 };
      await expect(service.createEvent(bad, organizer))
        .rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    });

    test('should create event successfully', async () => {
      const created = { id: 123, ...validInput };
      mockRepo.createEvent.mockResolvedValue(created);

      const result = await service.createEvent(validInput, organizer);

      expect(mockRepo.createEvent).toHaveBeenCalledWith({
        title: validInput.title,
        description: validInput.description,
        location: validInput.location,
        startDate: validInput.startDate,
        endDate: null,
        capacity: validInput.capacity,
        price: validInput.price,
        imageUrl: null,
        isPublished: false,
        categoryId: null,
        organizerId: organizer.id,
      });

      expect(result).toEqual(created);
    });
  });

  // -------------------------------------------------------
  // LIST EVENTS
  // -------------------------------------------------------
  describe('listEvents', () => {
    test('should call repository with correct query defaults', async () => {
      mockRepo.listEvents.mockResolvedValue([]);

      await service.listEvents({});

      expect(mockRepo.listEvents).toHaveBeenCalledWith({
        search: '',
        categoryId: undefined,
        page: 1,
        pageSize: 10,
      });
    });

    test('should convert categoryId, page, and pageSize to numbers', async () => {
      mockRepo.listEvents.mockResolvedValue([]);

      await service.listEvents({
        search: 'abc',
        categoryId: '5',
        page: '2',
        pageSize: '20',
      });

      expect(mockRepo.listEvents).toHaveBeenCalledWith({
        search: 'abc',
        categoryId: 5,
        page: 2,
        pageSize: 20,
      });
    });
  });

  // -------------------------------------------------------
  // GET EVENT BY ID
  // -------------------------------------------------------
  describe('getEventById', () => {
    test('should return event if found', async () => {
      const event = { id: 1 };
      mockRepo.getEventById.mockResolvedValue(event);

      const result = await service.getEventById(1);
      expect(result).toEqual(event);
    });

    test('should throw NOT_FOUND when no event', async () => {
      mockRepo.getEventById.mockResolvedValue(null);

      await expect(service.getEventById(1))
        .rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });

  // -------------------------------------------------------
  // UPDATE EVENT
  // -------------------------------------------------------
  describe('updateEvent', () => {
    const input = { title: 'Updated' };
    const owner = { id: 1, role: 'ORGANIZER' };
    const admin = { id: 99, role: 'ADMIN' };

    test('should throw UNAUTHENTICATED if no user', async () => {
      await expect(service.updateEvent(1, input, null))
        .rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    });

    test('should throw NOT_FOUND if event does not exist', async () => {
      mockRepo.getEventById.mockResolvedValue(null);

      await expect(service.updateEvent(1, input, owner))
        .rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    test('should throw FORBIDDEN if not owner and not admin', async () => {
      mockRepo.getEventById.mockResolvedValue({ organizerId: 5 });

      await expect(service.updateEvent(1, input, owner))
        .rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    test('should throw VALIDATION_ERROR when capacity <= 0', async () => {
      mockRepo.getEventById.mockResolvedValue({ organizerId: owner.id });

      await expect(service.updateEvent(1, { capacity: 0 }, owner))
        .rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    });

    test('should update as owner', async () => {
      mockRepo.getEventById.mockResolvedValue({ organizerId: owner.id });

      mockRepo.updateEvent.mockResolvedValue({ id: 1, title: 'Updated' });

      const result = await service.updateEvent(1, input, owner);

      expect(mockRepo.updateEvent).toHaveBeenCalledWith(1, input);
      expect(result).toEqual({ id: 1, title: 'Updated' });
    });

    test('should update as admin', async () => {
      mockRepo.getEventById.mockResolvedValue({ organizerId: 44 });

      mockRepo.updateEvent.mockResolvedValue({ id: 1, title: 'Updated' });

      const result = await service.updateEvent(1, input, admin);

      expect(result).toEqual({ id: 1, title: 'Updated' });
    });
  });

  // -------------------------------------------------------
  // DELETE EVENT
  // -------------------------------------------------------
  describe('deleteEvent', () => {
    const owner = { id: 1, role: 'ORGANIZER' };
    const admin = { id: 2, role: 'ADMIN' };

    test('should throw UNAUTHENTICATED when no user', async () => {
      await expect(service.deleteEvent(1, null))
        .rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    });

    test('should throw NOT_FOUND if no event', async () => {
      mockRepo.getEventById.mockResolvedValue(null);

      await expect(service.deleteEvent(1, owner))
        .rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    test('should throw FORBIDDEN for non-owner and non-admin', async () => {
      mockRepo.getEventById.mockResolvedValue({ organizerId: 99 });

      await expect(service.deleteEvent(1, owner))
        .rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    test('should delete as owner', async () => {
      mockRepo.getEventById.mockResolvedValue({ organizerId: owner.id });

      await service.deleteEvent(1, owner);

      expect(mockRepo.deleteEvent).toHaveBeenCalledWith(1);
    });

    test('should delete as admin', async () => {
      mockRepo.getEventById.mockResolvedValue({ organizerId: 33 });

      await service.deleteEvent(1, admin);

      expect(mockRepo.deleteEvent).toHaveBeenCalledWith(1);
    });
  });
});
