const express = require('express');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// GET /api/electricians
// Admin can see all, client can see active electricians
router.get('/', async (req, res) => {
  try {
    let query;
    let params = [];

    if (req.user.role === 'admin') {
      query = `
        SELECT
          electrician_id,
          full_name,
          phone_number,
          specialization,
          photo_url,
          status,
          created_at,
          updated_at
        FROM electricians
        ORDER BY full_name ASC
      `;
    } else {
      query = `
        SELECT
          electrician_id,
          full_name,
          phone_number,
          specialization,
          photo_url,
          status
        FROM electricians
        WHERE status = 'active'
        ORDER BY full_name ASC
      `;
    }

    const { rows } = await pool.query(query, params);

    res.json(rows);

  } catch (err) {
    console.error('GET ELECTRICIANS ERROR:', err);
    res.status(500).json({
      error: 'Failed to load electricians.'
    });
  }
});


// POST /api/electricians
// Admin only
router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const {
      full_name,
      phone_number,
      specialization,
      photo_url,
      status
    } = req.body;

    if (!full_name) {
      return res.status(400).json({
        error: 'Full name is required.'
      });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO electricians
      (
        full_name,
        phone_number,
        specialization,
        photo_url,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        full_name,
        phone_number || null,
        specialization || null,
        photo_url || null,
        status || 'active'
      ]
    );

    res.status(201).json(rows[0]);

  } catch (err) {
    console.error('CREATE ELECTRICIAN ERROR:', err);
    res.status(500).json({
      error: 'Failed to create electrician.'
    });
  }
});


// PUT /api/electricians/:id
// Admin only
router.put('/:id', requireRole('admin'), async (req, res) => {
  try {
    const {
      full_name,
      phone_number,
      specialization,
      photo_url,
      status
    } = req.body;

    const { rows } = await pool.query(
      `
      UPDATE electricians
      SET
        full_name = $1,
        phone_number = $2,
        specialization = $3,
        photo_url = $4,
        status = $5,
        updated_at = NOW()
      WHERE electrician_id = $6
      RETURNING *
      `,
      [
        full_name,
        phone_number || null,
        specialization || null,
        photo_url || null,
        status || 'active',
        req.params.id
      ]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: 'Electrician not found.'
      });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('UPDATE ELECTRICIAN ERROR:', err);
    res.status(500).json({
      error: 'Failed to update electrician.'
    });
  }
});


// DELETE /api/electricians/:id
// Admin only
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM electricians
      WHERE electrician_id = $1
      `,
      [req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        error: 'Electrician not found.'
      });
    }

    res.json({
      success: true
    });

  } catch (err) {
    console.error('DELETE ELECTRICIAN ERROR:', err);
    res.status(500).json({
      error: 'Failed to delete electrician.'
    });
  }
});

module.exports = router;