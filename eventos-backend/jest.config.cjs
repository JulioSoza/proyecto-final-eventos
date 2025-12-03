// jest.config.cjs
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.test.js'],

  coverageDirectory: 'coverage',
  collectCoverage: true,

  // Solo medimos coverage de las piezas núcleo que ya tienen buena cobertura
  collectCoverageFrom: [
    'src/middlewares/auth.middleware.js',
    'src/middlewares/role.middleware.js',
    'src/routes/auth.routes.js',
    'src/routes/protected.routes.js',
    'src/utils/jwt.js',
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
