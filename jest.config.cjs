// jest.config.cjs
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.test.js'],

  // Carpeta donde guardar el reporte
  coverageDirectory: 'coverage',

  // Activar coverage siempre
  collectCoverage: true,

  // Solo medimos estas piezas "core"
  collectCoverageFrom: [
    'src/middlewares/auth.middleware.js',
    'src/middlewares/role.middleware.js',
    'src/routes/**/*.js',
    'src/utils/**/*.js',
  ],

  // Ignoramos posibles copias internas o paquetes duplicados
  modulePathIgnorePatterns: ['<rootDir>/eventos-backend/'],

  // Umbral mínimo (80 % global)
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
};
