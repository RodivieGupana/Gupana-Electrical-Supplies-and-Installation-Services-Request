const express = require('express');
const pool = require('../config/db');
const { logActivity } = require('../config/helpers');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/schedule-blocks  (public - clients view available blocks before requesting)
router.get('/', async (req, res) => {
  const { from } = req.query;
  const fromDate = from || new Date().toISOString().slice(0, 10);
  const { rows } = await pool.query(
    `SELECT * FROM schedule_blocks
     WHERE is_available = TRUE AND block_date >= $1
     ORDER BY block_date ASC, start_time ASC`,
    [fromDate]
  );
  res.json(rows);
});

// POST /api/schedule-blocks  (admin only)
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  const { block_date, start_time, end_time, capacity } = req.body;
  if (!block_date || !start_time || !end_time) {
    return res.status(400).json({ error: 'block_date, start_time and end_time are required.' });
  }
  const { rows } = await pool.query(
    `INSERT INTO schedule_blocks (block_date, start_time, end_time, capacity)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [block_date, start_time, end_time, capacity || 1]
  );
  await logActivity(req.user.user_id, `Added schedule block ${block_date} ${start_time}-${end_time}`, 'Appointments');
  res.status(201).json(rows[0]);
});

// DELETE /api/schedule-blocks/:id (admin only)
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  await pool.query('DELETE FROM schedule_blocks WHERE block_id = $1', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
