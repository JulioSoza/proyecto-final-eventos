const AuthService = require('../services/auth.service');
const userRepository = require('../repositories/user.repository');
const passwordHasher = require('../utils/password');
const jwtLib = require('../utils/jwt');

const authService = new AuthService(userRepository, passwordHasher, jwtLib);

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    return res.status(201).json(user);
  } catch (err) {
    if (err.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 'EMAIL_EXISTS') {
      return res.status(409).json({ message: err.message });
    }
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  } catch (err) {
    if (err.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ message: err.message });
    }
    return next(err);
  }
}

module.exports = { register, login };
