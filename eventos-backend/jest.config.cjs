// jest.config.cjs
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.test.js'],

  // Donde guardar el coverage
  coverageDirectory: 'coverage',

  // ACTIVAR coverage real
  collectCoverage: true,

  // Qué archivos se medirán
  collectCoverageFrom: [
    'src/middlewares/auth.middleware.js',
    'src/middlewares/role.middleware.js',
    'src/routes/**/*.js',
    'src/utils/**/*.js',
  ],

  // Umbral mínimo (80%)
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
