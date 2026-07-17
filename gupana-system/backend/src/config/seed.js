/**
 * Run once after creating the schema to set a working admin password.
 * Usage: npm run seed
 */
const bcrypt = require('bcrypt');
const pool = require('./db');

async function seed() {
  const email = 'admin@gupana.com';
  const plainPassword = 'Admin@123';
  const hash = await bcrypt.hash(plainPassword, 10);

  await pool.query(
    `UPDATE users SET password_hash = $1 WHERE email = $2`,
    [hash, email]
  );

  console.log('Admin password set.');
  console.log('  email:', email);
  console.log('  password:', plainPassword);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
