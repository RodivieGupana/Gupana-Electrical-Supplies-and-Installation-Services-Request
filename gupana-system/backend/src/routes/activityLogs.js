const express = require('express');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, requireRole('admin'));

// GET /api/activity-logs  filterable ?module=&search=&from=&to=
router.get('/', async (req, res) => {
  const { module, search, from, to } = req.query;
  const conditions = [];
  const params = [];

  if (module && module !== 'All') {
    params.push(module);
    conditions.push(`al.module = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(al.action ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`);
  }
  if (from) {
    params.push(from);
    conditions.push(`al.created_at >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`al.created_at <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT al.*, u.full_name AS user_name, u.role AS user_role
     FROM activity_logs al LEFT JOIN users u ON u.user_id = al.user_id
     ${where} ORDER BY al.created_at DESC LIMIT 500`,
    params
  );
  res.json(rows);
});

module.exports = router;
