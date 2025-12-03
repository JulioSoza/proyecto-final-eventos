// src/services/category.service.js
class CategoryService {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async createCategory({ name }, currentUser) {
    if (!currentUser) {
      const err = new Error('Authentication required');
      err.code = 'UNAUTHENTICATED';
      throw err;
    }
    if ((currentUser.role || '').toUpperCase() !== 'ADMIN') {
      const err = new Error('Forbidden: only admins can create categories');
      err.code = 'FORBIDDEN';
      throw err;
    }
    if (!name) {
      const err = new Error('Name is required');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    return await this.categoryRepository.createCategory({ name });
  }

  async listCategories() {
    return await this.categoryRepository.listCategories();
  }
}

module.exports = CategoryService;
