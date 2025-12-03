// tests/helpers/db.js
const { pool } = require('../../src/db/pool');

async function resetDatabase() {
  await pool.query(`
    TRUNCATE TABLE tickets, events, users, categories
    RESTART IDENTITY CASCADE;
  `);
}

// De momento NO cerramos el pool para no romper otros tests.
// Lo dejamos como no-op.
async function closePool() {
  return;
}

module.exports = {
  resetDatabase,
  closePool,
};
