// src/db/pool.js
const { Pool } = require('pg');

console.log('>>> Cargando pool desde:', __filename);

const config = {
  host: process.env.PGHOST || '127.0.0.1',
  port: Number(process.env.PGPORT || 15432),
  user: process.env.PGUSER || 'eventos_app_user',
  password: process.env.PGPASSWORD || 'eventos_app_pass',
  database: process.env.PGDATABASE || 'eventos_db',
};

console.log('PG config (direct):', {
  host: config.host,
  port: config.port,
  user: config.user,
  database: config.database,
});

const pool = new Pool(config);

module.exports = { pool };
