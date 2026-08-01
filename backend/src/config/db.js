const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
      }
);

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error on idle client', err);
  process.exit(1);
});

module.exports = pool;
(async () => {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS database,
        current_schema() AS schema
    `);

    console.log("CONNECTED DATABASE:", result.rows[0]);

    const cols = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'service_requests'
      ORDER BY ordinal_position
    `);

    console.log("SERVICE_REQUESTS COLUMNS:");
    console.table(cols.rows);

  } catch (err) {
    console.error(err);
  }
})();
