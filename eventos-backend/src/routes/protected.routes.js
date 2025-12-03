// src/routes/protected.routes.js
const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const router = express.Router();

// Solo admins pueden entrar aquí
router.get('/admin-only', authMiddleware, requireRole('admin'), (req, res) => {
  res.json({
    message: 'Welcome admin',
    user: req.user
  });
});

module.exports = router;
