const pool = require('./db');

async function logActivity(userId, action, module, details = null, ipAddress = null) {
  await pool.query(
    `INSERT INTO activity_logs (user_id, action, module, details, ip_address)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, action, module, details, ipAddress]
  );
}

async function notify(userId, title, message, type = 'general', referenceId = null) {
  await pool.query(
    `INSERT INTO notifications (user_id, title, message, type, reference_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, title, message, type, referenceId]
  );
}

async function notifyAllAdmins(title, message, type = 'general', referenceId = null) {
  const { rows } = await pool.query(`SELECT user_id FROM users WHERE role = 'admin'`);
  for (const row of rows) {
    await notify(row.user_id, title, message, type, referenceId);
  }
}

function generateCode(prefix) {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${rand}`;
}

module.exports = { logActivity, notify, notifyAllAdmins, generateCode };
