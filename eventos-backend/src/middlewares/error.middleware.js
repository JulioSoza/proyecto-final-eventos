// src/middlewares/error.middleware.js

function errorMiddleware(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  // Errores de validación
  if (err.code === 'VALIDATION_ERROR') {
    return res.status(400).json({ error: err.message });
  }

  // Auth
  if (err.code === 'INVALID_CREDENTIALS' || err.code === 'UNAUTHENTICATED') {
    return res.status(401).json({ error: err.message });
  }

  // Roles / permisos
  if (err.code === 'FORBIDDEN') {
    return res.status(403).json({ error: err.message });
  }

  // No encontrado
  if (err.code === 'NOT_FOUND') {
    return res.status(404).json({ error: err.message });
  }

  // Capacidad insuficiente para tickets
  if (err.code === 'NOT_ENOUGH_CAPACITY') {
    return res.status(409).json({ error: err.message });
  }

  // Fallback
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorMiddleware;
