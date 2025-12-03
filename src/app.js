// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool } = require('./db/pool');

const authRoutes = require('./routes/auth.routes');
const protectedRoutes = require('./routes/protected.routes');
const eventsRoutes = require('./routes/events.routes');
const ticketsRoutes = require('./routes/tickets.routes');
const categoriesRoutes = require('./routes/categories.routes'); // Importar rutas de categorías
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// 1) CORS PRIMERO
app.use(cors()); // para desarrollo, permitimos todos los orígenes

// 2) Parseo de JSON
app.use(express.json());

// 3) Servir archivos estáticos de /uploads
//    Ej: /uploads/events/archivo.png
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 4) Rutas públicas
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/categories', categoriesRoutes); // Registrar las rutas de categorías

// 5) Rutas protegidas
app.use('/api/protected', protectedRoutes);
app.use('/api/tickets', ticketsRoutes);

// 6) Ruta de salud que también prueba la BD
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT current_user, current_database()');
    const row = result.rows[0];

    res.json({
      status: 'ok',
      database: 'connected',
      user: row.current_user,
      db: row.current_database,
    });
  } catch (error) {
    console.error('Error en /health:', error);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: error.message,
    });
  }
});

// 7) Middleware de errores al final
app.use(errorMiddleware);

module.exports = app;
