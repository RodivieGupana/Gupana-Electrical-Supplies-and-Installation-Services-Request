const express = require('express');
const pool = require('../config/db');
const { logActivity, notify, notifyAllAdmins, generateCode } = require('../config/helpers');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

const BASE_SELECT = `
SELECT
    sr.*,

    u.full_name AS client_name,
    u.email AS client_email,
    u.phone_number,

    s.service_name,
    s.category,

    sb.block_date AS preferred_date,
    sb.start_time AS preferred_start_time,
    sb.end_time AS preferred_end_time,

    ab.block_date AS assigned_date,
    ab.start_time AS assigned_start_time,
    ab.end_time AS assigned_end_time

FROM service_requests sr

JOIN users u
ON u.user_id = sr.client_id

JOIN services s
ON s.service_id = sr.service_id

LEFT JOIN schedule_blocks sb
ON sb.block_id = sr.preferred_block_id

LEFT JOIN schedule_blocks ab
ON ab.block_id = sr.assigned_block_id
`;

// GET /api/service-requests  (admin: all, filterable; client: own only)
router.get('/', async (req, res) => {
  const { status, search } = req.query;
  const conditions = [];
  const params = [];

  if (req.user.role === 'client') {
    params.push(req.user.user_id);
    conditions.push(`sr.client_id = $${params.length}`);
  }
  if (status && status !== 'All') {
    params.push(status.toLowerCase());
    conditions.push(`sr.status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(sr.request_code ILIKE $${params.length} OR u.full_name ILIKE $${params.length} OR s.service_name ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(`${BASE_SELECT} ${where} ORDER BY sr.created_at DESC`, params);
  res.json(rows);
});

// GET /api/service-requests/:id
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query(`${BASE_SELECT} WHERE sr.request_id = $1`, [req.params.id]);
  const request = rows[0];
  if (!request) return res.status(404).json({ error: 'Service request not found.' });
  if (req.user.role === 'client' && request.client_id !== req.user.user_id) {
    return res.status(403).json({ error: 'Not allowed.' });
  }
  res.json(request);
});

// POST /api/service-requests  (client submits a new request)
router.post('/', requireRole('client'), async (req, res) => {
  const {
    service_id,
    problem_description,
    preferred_block_id,
    province,
    municipality,
    barangay,
    street
} = req.body;
  if (!service_id) return res.status(400).json({ error: 'service_id is required.' });

  const code = generateCode('SR');
  const { rows } = await pool.query(
  `INSERT INTO service_requests
  (
    request_code,
    client_id,
    service_id,
    problem_description,
    preferred_block_id,
    province,
    municipality,
    barangay,
    street
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING *`,
  [
    code,
    req.user.user_id,
    service_id,
    problem_description || null,
    preferred_block_id || null,
    province || null,
    municipality || null,
    barangay || null,
    street || null
  ]
);

  await notifyAllAdmins('New Service Request', `${req.user.full_name} submitted a new service request (${code}).`, 'request', rows[0].request_id);
  await logActivity(req.user.user_id, `Submitted service request ${code}`, 'Service Requests');
  res.status(201).json(rows[0]);
});

// PUT /api/service-requests/:id/status
router.put('/:id/status', requireRole('admin'), async (req, res) => {

    const {
        status,
        admin_comment,
        assigned_block_id
    } = req.body;

    const allowed = [
        'pending',
        'approved',
        'completed',
        'cancelled'
    ];

    if (!allowed.includes(status)) {
        return res.status(400).json({
            error: 'Invalid status.'
        });
    }

    const oldRequest = await pool.query(
        `SELECT * FROM service_requests
         WHERE request_id=$1`,
        [req.params.id]
    );

    if (!oldRequest.rows.length) {
        return res.status(404).json({
            error: 'Service request not found.'
        });
    }

    const previousBlock =
        oldRequest.rows[0].assigned_block_id;

    const { rows } = await pool.query(

        `UPDATE service_requests

        SET

        status=$1,

        admin_comment=$2,

        assigned_block_id=$3,

        updated_at=NOW()

        WHERE request_id=$4

        RETURNING *`,

        [

            status,

            admin_comment || null,

            assigned_block_id || null,

            req.params.id

        ]

    );

    const request = rows[0];

    if (
        previousBlock != assigned_block_id
    ) {

        await pool.query(

        `INSERT INTO schedule_history
        (
            request_id,
            old_block_id,
            new_block_id,
            changed_by
        )

        VALUES
        (
            $1,$2,$3,$4
        )`,

        [

            request.request_id,

            previousBlock,

            assigned_block_id,

            req.user.user_id

        ]

        );

    }

    await notify(

        request.client_id,

        'Schedule Updated',

        'Your service request schedule has been updated.',

        'request',

        request.request_id

    );

    await logActivity(

        req.user.user_id,

        `Updated request ${request.request_code}`,

        'Service Requests'

    );

    res.json(request);

});

// DELETE /api/service-requests/:id  (admin only)
router.delete('/:id', requireRole('admin'), async (req, res) => {
  await pool.query('DELETE FROM service_requests WHERE request_id = $1', [req.params.id]);
  await logActivity(req.user.user_id, `Deleted service request #${req.params.id}`, 'Service Requests');
  res.json({ success: true });
});

module.exports = router;
