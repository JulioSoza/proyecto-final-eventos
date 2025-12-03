// scripts/init-db.js
require('dotenv').config();
const { pool } = require('../src/db/pool');

async function init() {
  console.log('Inicializando esquema de BD para tests...');

  // 1) categories
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // 2) users
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // 3) events
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      start_date TIMESTAMPTZ NOT NULL,
      end_date TIMESTAMPTZ,
      capacity INT NOT NULL,
      price NUMERIC(10,2) NOT NULL,
      image_url TEXT,
      is_published BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      category_id INT REFERENCES categories(id),
      organizer_id INT NOT NULL REFERENCES users(id)
    );
  `);

  // 4) tickets
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      quantity INT NOT NULL,
      unit_price NUMERIC(10,2) NOT NULL,
      total NUMERIC(10,2) NOT NULL,
      user_id INT NOT NULL REFERENCES users(id),
      event_id INT NOT NULL REFERENCES events(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  console.log('Esquema listo ✅');
  await pool.end();
}

init().catch((err) => {
  console.error('Error inicializando esquema de BD', err);
  process.exit(1);
});
