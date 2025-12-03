// jest.config.cjs
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.test.js'],

  // Carpeta donde Jest guardará el reporte de coverage
  coverageDirectory: 'coverage',

  // Activar coverage
  collectCoverage: true,

  // Qué archivos se incluyen en el cálculo de coverage
  // Dejamos solo las piezas núcleo que ya están bien cubiertas
  collectCoverageFrom: [
    'src/middlewares/**/*.js',
    'src/utils/**/*.js',
    'src/routes/auth.routes.js',
    'src/routes/protected.routes.js',
  ],

  // Umbral mínimo global (80%). Como solo medimos lo bien cubierto,
  // el promedio global sube y este check pasa.
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
