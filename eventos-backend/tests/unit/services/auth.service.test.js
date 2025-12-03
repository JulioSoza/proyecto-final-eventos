const AuthService = require('../../../src/services/auth.service');

describe('AuthService', () => {
  let userRepository;
  let passwordHasher;
  let jwtLib;
  let service;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    jwtLib = {
      sign: jest.fn(),
    };

    service = new AuthService(userRepository, passwordHasher, jwtLib);
  });

  test('register registra usuario nuevo y no devuelve password', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue('hashed_pw');
    userRepository.create.mockResolvedValue({
      id: 1,
      name: 'Julio',
      email: 'julio@example.com',
      password: 'hashed_pw',
      role: 'USER',
    });

    const result = await service.register({
      name: 'Julio',
      email: 'julio@example.com',
      password: 'secreto123',
      role: 'user', // entra en minúsculas
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith('julio@example.com');
    expect(passwordHasher.hash).toHaveBeenCalledWith('secreto123');
    expect(userRepository.create).toHaveBeenCalledWith({
      name: 'Julio',
      email: 'julio@example.com',
      password: 'hashed_pw',
      role: 'USER', // se normaliza a mayúsculas
    });

    expect(result).toEqual({
      id: 1,
      name: 'Julio',
      email: 'julio@example.com',
      role: 'USER',
    });
  });

  test('login devuelve token y usuario sin password cuando credenciales son válidas', async () => {
    const dbUser = {
      id: 1,
      name: 'Julio',
      email: 'julio@example.com',
      password: 'hashed_pw',
      role: 'USER',
    };

    userRepository.findByEmail.mockResolvedValue(dbUser);
    passwordHasher.compare.mockResolvedValue(true);
    jwtLib.sign.mockReturnValue('fake.jwt.token');

    const result = await service.login({
      email: 'julio@example.com',
      password: 'secreto123',
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith('julio@example.com');
    expect(passwordHasher.compare).toHaveBeenCalledWith('secreto123', 'hashed_pw');
    expect(jwtLib.sign).toHaveBeenCalledWith({
      id: dbUser.id,
      role: dbUser.role,
    });

    expect(result).toEqual({
      token: 'fake.jwt.token',
      user: {
        id: 1,
        name: 'Julio',
        email: 'julio@example.com',
        role: 'USER',
      },
    });
  });
});
