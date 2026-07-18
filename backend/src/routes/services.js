const express = require('express');
const pool = require('../config/db');
const { logActivity } = require('../config/helpers');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/services  (public - clients browse available services)
router.get('/', async (req, res) => {
  const { active } = req.query;
  const where = active === 'true' ? 'WHERE is_active = TRUE' : '';
  const { rows } = await pool.query(`SELECT * FROM services ${where} ORDER BY service_id ASC`);
  res.json(rows);
});

// GET /api/services/:id
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM services WHERE service_id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Service not found.' });
  res.json(rows[0]);
});

// POST /api/services  (admin only)
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  const { service_name, category, description, icon, base_price } = req.body;
  if (!service_name || !category) {
    return res.status(400).json({ error: 'service_name and category are required.' });
  }
  const { rows } = await pool.query(
    `INSERT INTO services (service_name, category, description, icon, base_price)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [service_name, category, description || null, icon || 'zap', base_price || null]
  );
  await logActivity(req.user.user_id, `Created service "${service_name}"`, 'Services');
  res.status(201).json(rows[0]);
});

// PUT /api/services/:id  (admin only)
router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { service_name, category, description, icon, base_price, is_active } = req.body;
  const { rows } = await pool.query(
    `UPDATE services SET
       service_name = COALESCE($1, service_name),
       category = COALESCE($2, category),
       description = COALESCE($3, description),
       icon = COALESCE($4, icon),
       base_price = COALESCE($5, base_price),
       is_active = COALESCE($6, is_active)
     WHERE service_id = $7 RETURNING *`,
    [service_name, category, description, icon, base_price, is_active, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Service not found.' });
  await logActivity(req.user.user_id, `Updated service #${req.params.id}`, 'Services');
  res.json(rows[0]);
});

// DELETE /api/services/:id  (admin only)
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  await pool.query('DELETE FROM services WHERE service_id = $1', [req.params.id]);
  await logActivity(req.user.user_id, `Deleted service #${req.params.id}`, 'Services');
  res.json({ success: true });
});

module.exports = router;
