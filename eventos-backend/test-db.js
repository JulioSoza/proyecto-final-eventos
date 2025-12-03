// test-db.js
const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: 'localhost',
    port: 15432,
    user: 'eventos_app_user',
    password: 'eventos_app_pass',
    database: 'eventos_db',
  });

  try {
    console.log('Conectando a Postgres...');
    await client.connect();
    console.log('Conectado ✅');

    const res = await client.query('SELECT current_user, current_database()');
    console.log('Resultado:', res.rows);

    await client.end();
    console.log('Conexión cerrada ✅');
  } catch (err) {
    console.error('ERROR al conectar/query:', err);
  }
}

main();
