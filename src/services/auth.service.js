// src/services/auth.service.js

class AuthService {
  constructor(userRepository, passwordHasher, jwtLib) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher; // { hash, compare }
    this.jwtLib = jwtLib; // { sign }
  }

  async register({ name, email, password, role = 'USER' }) {
    if (!email || !password) {
      const err = new Error('Email and password are required');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    // Aseguramos rol válido para el enum de Postgres
    let finalRole = (role || 'USER').toUpperCase();
    const allowedRoles = ['USER', 'ORGANIZER', 'ADMIN'];
    if (!allowedRoles.includes(finalRole)) {
      finalRole = 'USER';
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      const err = new Error('Email already in use');
      err.code = 'EMAIL_EXISTS';
      throw err;
    }

    const hashedPassword = await this.passwordHasher.hash(password);

    const newUser = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
    });

    // No devolvemos el password
    const { password: _pw, ...safeUser } = newUser;
    return safeUser;
  }

  async login({ email, password }) {
    if (!email || !password) {
      const err = new Error('Email and password are required');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid credentials');
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const isMatch = await this.passwordHasher.compare(password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid credentials');
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const token = this.jwtLib.sign({
      id: user.id,
      role: user.role,
    });

    const { password: _pw, ...safeUser } = user;

    return {
      token,
      user: safeUser,
    };
  }
}

module.exports = AuthService;
