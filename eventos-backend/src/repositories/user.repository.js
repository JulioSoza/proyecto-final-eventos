// src/repositories/user.repository.js
const { pool } = require('../db/pool');

// Mapea columnas de la BD a propiedades que usa la app
function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password_hash, // AuthService espera "password"
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function create({ name, email, password, role = 'USER' }) {
  const query = `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, password_hash, role, created_at, updated_at
  `;
  const params = [name, email, password, role];

  const { rows } = await pool.query(query, params);
  return mapUser(rows[0]);
}

async function findByEmail(email) {
  const query = `
    SELECT id, name, email, password_hash, role, created_at, updated_at
    FROM users
    WHERE email = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [email]);
  return mapUser(rows[0]);
}

async function findById(id) {
  const query = `
    SELECT id, name, email, password_hash, role, created_at, updated_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [id]);
  return mapUser(rows[0]);
}

module.exports = {
  create,
  findByEmail,
  findById,
};
