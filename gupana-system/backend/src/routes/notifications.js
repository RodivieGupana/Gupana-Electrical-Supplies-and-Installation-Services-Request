const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/notifications  (own notifications, newest first)
router.get('/', async (req, res) => {
  const { unread } = req.query;
  const where = unread === 'true' ? 'AND is_read = FALSE' : '';
  const { rows } = await pool.query(
    `SELECT * FROM notifications WHERE user_id = $1 ${where} ORDER BY created_at DESC LIMIT 100`,
    [req.user.user_id]
  );
  res.json(rows);
});

// GET /api/notifications/unread-count
router.get('/unread-count', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
    [req.user.user_id]
  );
  res.json(rows[0]);
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE notification_id = $1 AND user_id = $2 RETURNING *`,
    [req.params.id, req.user.user_id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Notification not found.' });
  res.json(rows[0]);
});

// PUT /api/notifications/read-all
router.put('/read-all', async (req, res) => {
  await pool.query(`UPDATE notifications SET is_read = TRUE WHERE user_id = $1`, [req.user.user_id]);
  res.json({ success: true });
});

module.exports = router;
