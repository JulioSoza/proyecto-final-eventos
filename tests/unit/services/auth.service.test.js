const AuthService = require('../../../src/services/auth.service');

const userRepository = require('../../../src/repositories/user.repository');
const passwordUtils = require('../../../src/utils/password');
const jwtLib = require('../../../src/utils/jwt');

jest.mock('../../../src/repositories/user.repository');
jest.mock('../../../src/utils/password');
jest.mock('../../../src/utils/jwt');

describe('AuthService - Unit Tests', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(userRepository, passwordUtils, jwtLib);
  });

  test('login debe fallar si el usuario no existe', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'test@test.com', password: '1234' })
    ).rejects.toThrow('Invalid credentials');
  });

  test('login debe fallar si la contraseña es incorrecta', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 1, password: 'hashed' });
    passwordUtils.compare.mockResolvedValue(false);

    await expect(
      service.login({ email: 'test@test.com', password: '1234' })
    ).rejects.toThrow('Invalid credentials');
  });

  test('login debe devolver token si todo está bien', async () => {
    const mockUser = { id: 1, role: 'USER', password: 'hashed' };

    userRepository.findByEmail.mockResolvedValue(mockUser);
    passwordUtils.compare.mockResolvedValue(true);
    jwtLib.sign.mockReturnValue('fake-token');

    const result = await service.login({
      email: 'test@test.com',
      password: '1234'
    });

    expect(result.token).toBe('fake-token');
    expect(jwtLib.sign).toHaveBeenCalledWith({
      id: 1,
      role: 'USER',
    });
  });
});
