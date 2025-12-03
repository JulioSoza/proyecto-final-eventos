// src/db/pool.js
require('dotenv').config();
const { Pool } = require('pg');

console.log('>>> Cargando pool desde:', __filename);

const isTest = process.env.NODE_ENV === 'test';

const config = {
  // Host: primero DB_HOST, luego PGHOST, luego localhost
  host:
    process.env.DB_HOST ||
    process.env.PGHOST ||
    'localhost',

  // Puerto: primero DB_PORT, luego PGPORT, y si no hay nada:
  // - en test: 5432 (CI)
  // - en otros entornos: 15432 (tu Docker local)
  port: Number(
    process.env.DB_PORT ||
    process.env.PGPORT ||
    (isTest ? 5432 : 15432)
  ),

  user:
    process.env.DB_USER ||
    process.env.PGUSER ||
    'eventos_app_user',

  password:
    process.env.DB_PASSWORD ||
    process.env.PGPASSWORD ||
    'eventos_app_pass',

  database:
    process.env.DB_NAME ||
    process.env.PGDATABASE ||
    'eventos_db',
};

console.log('PG config (direct):', {
  host: config.host,
  port: config.port,
  user: config.user,
  database: config.database,
});

const pool = new Pool(config);

module.exports = { pool };
