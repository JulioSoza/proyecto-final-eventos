// src/middlewares/auth.middleware.js
const jwtLib = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwtLib.verify(token);
    req.user = payload; // { id, role, ... }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = authMiddleware;
