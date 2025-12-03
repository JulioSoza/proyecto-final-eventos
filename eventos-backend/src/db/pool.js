// src/db/pool.js
const { Pool } = require('pg');

console.log('>>> Cargando pool desde:', __filename);

const pool = new Pool({
  host: 'localhost',
  port: 15432,              // el puerto que ves en `docker compose ps`
  user: 'eventos_app_user', // el usuario que pusimos en docker-compose
  password: 'eventos_app_pass',
  database: 'eventos_db',
});

console.log('PG config (direct):', {
  host: 'localhost',
  port: 15432,
  user: 'eventos_app_user',
  database: 'eventos_db',
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de Postgres:', err);
  process.exit(-1);
});

module.exports = { pool };
