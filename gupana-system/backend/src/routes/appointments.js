const express = require('express');
const pool = require('../config/db');
const { logActivity, notify } = require('../config/helpers');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

const BASE_SELECT = `
  SELECT a.*, u.full_name AS client_name, u.email AS client_email, u.phone_number AS client_phone,
         s.service_name, sr.request_code
  FROM appointments a
  JOIN users u ON u.user_id = a.client_id
  JOIN services s ON s.service_id = a.service_id
  JOIN service_requests sr ON sr.request_id = a.request_id
`;

// GET /api/appointments  (admin: all; client: own) filterable by ?status=&from=&to=
router.get('/', async (req, res) => {
  const { status, from, to } = req.query;
  const conditions = [];
  const params = [];

  if (req.user.role === 'client') {
    params.push(req.user.user_id);
    conditions.push(`a.client_id = $${params.length}`);
  }
  if (status && status !== 'All') {
    params.push(status.toLowerCase());
    conditions.push(`a.status = $${params.length}`);
  }
  if (from) {
    params.push(from);
    conditions.push(`a.appointment_date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`a.appointment_date <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `${BASE_SELECT} ${where} ORDER BY a.appointment_date ASC, a.start_time ASC`,
    params
  );
  res.json(rows);
});

// GET /api/appointments/:id
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query(`${BASE_SELECT} WHERE a.appointment_id = $1`, [req.params.id]);
  const appt = rows[0];
  if (!appt) return res.status(404).json({ error: 'Appointment not found.' });
  if (req.user.role === 'client' && appt.client_id !== req.user.user_id) {
    return res.status(403).json({ error: 'Not allowed.' });
  }
  res.json(appt);
});

// POST /api/appointments  (admin assigns an appointment for a service request)
router.post('/', requireRole('admin'), async (req, res) => {
  const { request_id, appointment_date, start_time, end_time, location, note } = req.body;
  if (!request_id || !appointment_date || !start_time || !end_time) {
    return res.status(400).json({ error: 'request_id, appointment_date, start_time and end_time are required.' });
  }

  const reqRow = await pool.query(
    'SELECT client_id, service_id, request_code FROM service_requests WHERE request_id = $1',
    [request_id]
  );
  if (!reqRow.rows[0]) return res.status(404).json({ error: 'Service request not found.' });
  const { client_id, service_id, request_code } = reqRow.rows[0];

  const { rows } = await pool.query(
    `INSERT INTO appointments (request_id, client_id, service_id, appointment_date, start_time, end_time, location, note, status, assigned_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed', $9) RETURNING *`,
    [request_id, client_id, service_id, appointment_date, start_time, end_time, location || null, note || null, req.user.user_id]
  );

  await pool.query(`UPDATE service_requests SET status = 'approved' WHERE request_id = $1`, [request_id]);
  await notify(client_id, 'Appointment Confirmed', `Your appointment for request ${request_code} is confirmed on ${appointment_date}.`, 'appointment', rows[0].appointment_id);
  await logActivity(req.user.user_id, `Scheduled appointment for request ${request_code}`, 'Appointments');
  res.status(201).json(rows[0]);
});

// PUT /api/appointments/:id/status
router.put('/:id/status', requireRole('admin'), async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status.' });

  const { rows } = await pool.query(
    `UPDATE appointments SET status = $1 WHERE appointment_id = $2 RETURNING *`,
    [status, req.params.id]
  );
  const appt = rows[0];
  if (!appt) return res.status(404).json({ error: 'Appointment not found.' });

  await notify(appt.client_id, 'Appointment Update', `Your appointment is now ${status}.`, 'appointment', appt.appointment_id);
  await logActivity(req.user.user_id, `Set appointment #${appt.appointment_id} to ${status}`, 'Appointments');
  res.json(appt);
});

// PUT /api/appointments/:id/reschedule
router.put('/:id/reschedule', requireRole('admin'), async (req, res) => {
  const { appointment_date, start_time, end_time } = req.body;
  const { rows } = await pool.query(
    `UPDATE appointments SET appointment_date = COALESCE($1, appointment_date),
       start_time = COALESCE($2, start_time), end_time = COALESCE($3, end_time)
     WHERE appointment_id = $4 RETURNING *`,
    [appointment_date, start_time, end_time, req.params.id]
  );
  const appt = rows[0];
  if (!appt) return res.status(404).json({ error: 'Appointment not found.' });
  await notify(appt.client_id, 'Appointment Rescheduled', `Your appointment has been rescheduled to ${appt.appointment_date}.`, 'appointment', appt.appointment_id);
  await logActivity(req.user.user_id, `Rescheduled appointment #${appt.appointment_id}`, 'Appointments');
  res.json(appt);
});

module.exports = router;
