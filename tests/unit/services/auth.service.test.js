// tests/unit/auth.service.test.js
const AuthService = require('../../src/services/auth.service');
const userRepository = require('../../src/repositories/user.repository');
const hashLib = require('../../src/utils/hash');
const jwtLib = require('../../src/utils/jwt');

// Mock del userRepository (NO DB)
jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/utils/hash');
jest.mock('../../src/utils/jwt');

describe('AuthService - Unit Tests', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(userRepository);
  });

  test('register crea usuario y oculta password', async () => {
    hashLib.hashPassword.mockResolvedValue('hashed123');

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({
      id: 1,
      name: 'Julio',
      email: 'julio@test.com',
      role: 'ADMIN',
      password: 'hashed123'
    });

    const result = await service.register({
      name: 'Julio',
      email: 'julio@test.com',
      password: '123456',
      role: 'admin'
    });

    expect(result.email).toBe('julio@test.com');
    expect(result.password).toBeUndefined();
    expect(hashLib.hashPassword).toHaveBeenCalled();
  });

  test('register falla si email ya existe', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 10 });

    await expect(service.register({
      name: 'Julio',
      email: 'existente@test.com',
      password: '123456'
    })).rejects.toThrow('Email already registered');
  });

  test('login devuelve token y usuario', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 1,
      name: 'Julio',
      email: 'julio@test.com',
      password: 'hashed',
      role: 'USER'
    });

    hashLib.comparePasswords.mockResolvedValue(true);
    jwtLib.sign.mockReturnValue('fake-token');

    const result = await service.login('julio@test.com', '123456');

    expect(result.token).toBe('fake-token');
    expect(jwtLib.sign).toHaveBeenCalled();
  });

  test('login falla si contraseña incorrecta', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 1,
      password: 'hashed'
    });

    hashLib.comparePasswords.mockResolvedValue(false);

    await expect(service.login('test@test.com', '123'))
      .rejects.toThrow('Invalid credentials');
  });
});
