// jest.config.cjs
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: 'coverage',

  // Solo medimos coverage de las piezas "core" que ya probaste bien
  collectCoverageFrom: [
    'src/middlewares/auth.middleware.js',
    'src/middlewares/role.middleware.js',
    'src/routes/**/*.js',
    'src/utils/**/*.js',
  ],

  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
