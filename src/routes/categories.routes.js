// src/routes/categories.routes.js
const express = require('express');
const CategoryService = require('../services/category.service');
const categoryRepository = require('../repositories/category.repository');
const requireAuth = require('../middlewares/auth.middleware');

const router = express.Router();
const categoryService = new CategoryService(categoryRepository);

// POST /api/categories -> crear categoría (solo ADMIN)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const result = await categoryService.createCategory(
      { name: req.body.name },
      req.user
    );
    res.status(201).json(result);
  } catch (err) {
    if (err.code === 'FORBIDDEN') {
      return res.status(403).json({ error: err.message });
    }
    if (err.code === 'UNAUTHENTICATED') {
      return res.status(401).json({ error: err.message });
    }
    if (err.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// GET /api/categories -> listar todas las categorías
router.get('/', async (req, res, next) => {
  try {
    const categories = await categoryService.listCategories();
    res.json({ items: categories });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
