// src/repositories/category.repository.js
const { pool } = require('../db/pool');

function slugify(str) {
  return String(str)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')   // elimina acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')              // espacios por guiones
    .replace(/[^a-z0-9-]/g, '');       // otros caracteres fuera
}

async function createCategory({ name }) {
  const slug = slugify(name);
  const { rows } = await pool.query(
    'INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *',
    [name, slug]
  );
  return rows[0];
}

async function listCategories() {
  const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
  return rows;
}

module.exports = {
  createCategory,
  listCategories,
};
