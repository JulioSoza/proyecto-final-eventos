const CategoryService = require('../../../src/services/category.service');
const categoryRepository = require('../../../src/repositories/category.repository');

jest.mock('../../../src/repositories/category.repository');

describe('CategoryService - Unit Tests', () => {
  let service;
  const mockAdmin = { id: 1, role: 'ADMIN' };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CategoryService(categoryRepository);
  });

  test('createCategory debe fallar si name está vacío', async () => {
    await expect(service.createCategory({ name: '' }, mockAdmin))
      .rejects.toThrow('Name is required');

    await expect(service.createCategory({}, mockAdmin))
      .rejects.toThrow('Name is required');
  });

  test('createCategory delega correctamente al repositorio', async () => {
    categoryRepository.createCategory.mockResolvedValue({
      id: 1,
      name: 'Conciertos'
    });

    const result = await service.createCategory({ name: 'Conciertos' }, mockAdmin);

    expect(result.id).toBe(1);
    expect(result.name).toBe('Conciertos');
    expect(categoryRepository.createCategory).toHaveBeenCalledWith({
      name: 'Conciertos'
    });
  });
});
