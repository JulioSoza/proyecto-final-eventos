// src/services/event.service.js

class EventService {
  constructor(eventRepository) {
    this.eventRepository = eventRepository;
  }

  async createEvent(input, currentUser) {
    if (!currentUser) {
      const err = new Error('Authentication required');
      err.code = 'UNAUTHENTICATED';
      throw err;
    }

    const role = (currentUser.role || '').toUpperCase();
    if (!['ORGANIZER', 'ADMIN'].includes(role)) {
      const err = new Error('Only organizers or admins can create events');
      err.code = 'FORBIDDEN';
      throw err;
    }

    const {
      title,
      description,
      location,
      startDate,
      endDate,
      capacity,
      price,
      imageUrl,
      isPublished = false,
      categoryId,
    } = input;

    if (!title || !description || !location || !startDate || capacity == null || price == null) {
      const err = new Error('Missing required event fields');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    if (capacity <= 0) {
      const err = new Error('Capacity must be greater than zero');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const event = await this.eventRepository.createEvent({
      title,
      description,
      location,
      startDate,
      endDate: endDate || null,
      capacity,
      price,
      imageUrl: imageUrl || null,
      isPublished: Boolean(isPublished),
      categoryId: categoryId || null,
      organizerId: currentUser.id,
    });

    return event;
  }

  async listEvents(query) {
    const {
      search = '',
      categoryId,
      page = 1,
      pageSize = 10,
    } = query || {};

    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 10;

    return this.eventRepository.listEvents({
      search: search || '',
      categoryId: categoryId ? Number(categoryId) : undefined,
      page: pageNum,
      pageSize: sizeNum,
    });
  }

  async getEventById(id) {
    const event = await this.eventRepository.getEventById(id);
    if (!event) {
      const err = new Error('Event not found');
      err.code = 'NOT_FOUND';
      throw err;
    }
    return event;
  }

  async updateEvent(id, input, currentUser) {
    if (!currentUser) {
      const err = new Error('Authentication required');
      err.code = 'UNAUTHENTICATED';
      throw err;
    }

    const existing = await this.eventRepository.getEventById(id);
    if (!existing) {
      const err = new Error('Event not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    const role = (currentUser.role || '').toUpperCase();
    const isOwner = existing.organizerId === currentUser.id;

    if (!isOwner && role !== 'ADMIN') {
      const err = new Error('Only the organizer or admin can update this event');
      err.code = 'FORBIDDEN';
      throw err;
    }

    if (input.capacity != null && input.capacity <= 0) {
      const err = new Error('Capacity must be greater than zero');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const updated = await this.eventRepository.updateEvent(id, input);
    return updated;
  }

  async deleteEvent(id, currentUser) {
    if (!currentUser) {
      const err = new Error('Authentication required');
      err.code = 'UNAUTHENTICATED';
      throw err;
    }

    const existing = await this.eventRepository.getEventById(id);
    if (!existing) {
      const err = new Error('Event not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    const role = (currentUser.role || '').toUpperCase();
    const isOwner = existing.organizerId === currentUser.id;

    if (!isOwner && role !== 'ADMIN') {
      const err = new Error('Only the organizer or admin can delete this event');
      err.code = 'FORBIDDEN';
      throw err;
    }

    await this.eventRepository.deleteEvent(id);
  }
}

module.exports = EventService;
