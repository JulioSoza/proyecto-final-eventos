// tests/unit/services/category.service.test.js
const CategoryService = require('../../../src/services/category.service');
const categoryRepository = require('../../../src/repositories/category.repository');

// Mock del repositorio
jest.mock('../../../src/repositories/category.repository');

describe('CategoryService - Unit Tests', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CategoryService(categoryRepository);
  });

  test('createCategory debe fallar si name está vacío', async () => {
    await expect(service.createCategory({ name: '' }))
      .rejects.toThrow('Category name is required');

    await expect(service.createCategory({}))
      .rejects.toThrow('Category name is required');
  });

  test('createCategory delega correctamente al repositorio', async () => {
    categoryRepository.createCategory.mockResolvedValue({
      id: 1,
      name: 'Conciertos'
    });

    const result = await service.createCategory({ name: 'Conciertos' });

    expect(result.id).toBe(1);
    expect(result.name).toBe('Conciertos');
    expect(categoryRepository.createCategory).toHaveBeenCalledWith({
      name: 'Conciertos'
    });
  });

  test('listCategories devuelve un array', async () => {
    categoryRepository.listCategories.mockResolvedValue([
      { id: 1, name: 'Deportes' }
    ]);

    const result = await service.listCategories();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });
});
