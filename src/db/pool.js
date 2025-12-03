// src/db/pool.js
const { Pool } = require('pg');

console.log('>>> Cargando pool desde:', __filename);

// Si existe DATABASE_URL (CI / producción), úsala primero
let poolConfig;

if (process.env.DATABASE_URL) {
  console.log('Usando DATABASE_URL para conexión PG');
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
  };
} else {
  console.log('Usando configuración local para conexión PG');
  poolConfig = {
    host: process.env.PGHOST || '127.0.0.1',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'eventos_app_user',
    password: process.env.PGPASSWORD || 'eventos_app_pass',
    database: process.env.PGDATABASE || 'eventos_db',
  };
}

console.log('PG config final:', poolConfig);

const pool = new Pool(poolConfig);

module.exports = { pool };
