const express = require('express');
const pool = require('../config/db');
const { logActivity, notify, notifyAllAdmins, generateCode } = require('../config/helpers');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

const BASE_SELECT = `
  SELECT i.*, u.full_name AS client_name, u.email AS client_email
  FROM inquiries i
  JOIN users u ON u.user_id = i.client_id
`;

// GET /api/inquiries  (admin: all; client: own) filterable ?status=&search=
router.get('/', async (req, res) => {
  const { status, search } = req.query;
  const conditions = [];
  const params = [];

  if (req.user.role === 'client') {
    params.push(req.user.user_id);
    conditions.push(`i.client_id = $${params.length}`);
  }
  if (status && status !== 'All') {
    params.push(status.toLowerCase());
    conditions.push(`i.status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(i.subject ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(`${BASE_SELECT} ${where} ORDER BY i.created_at DESC`, params);
  res.json(rows);
});

// POST /api/inquiries  (client sends new inquiry)
router.post('/', requireRole('client'), async (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) return res.status(400).json({ error: 'subject and message are required.' });

  const code = generateCode('INQ');
  const { rows } = await pool.query(
    `INSERT INTO inquiries (inquiry_code, client_id, subject, message)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [code, req.user.user_id, subject, message]
  );

  await notifyAllAdmins('New Inquiry', `${req.user.full_name} sent an inquiry: "${subject}".`, 'inquiry', rows[0].inquiry_id);
  await logActivity(req.user.user_id, `Sent inquiry ${code}`, 'Inquiries');
  res.status(201).json(rows[0]);
});

// PUT /api/inquiries/:id/reply  (admin replies)
router.put('/:id/reply', requireRole('admin'), async (req, res) => {
  const { reply } = req.body;
  if (!reply) return res.status(400).json({ error: 'reply is required.' });

  const { rows } = await pool.query(
    `UPDATE inquiries SET reply = $1, status = 'answered', answered_by = $2, answered_at = NOW()
     WHERE inquiry_id = $3 RETURNING *`,
    [reply, req.user.user_id, req.params.id]
  );
  const inquiry = rows[0];
  if (!inquiry) return res.status(404).json({ error: 'Inquiry not found.' });

  await notify(inquiry.client_id, 'Inquiry Answered', `Your inquiry "${inquiry.subject}" has been answered.`, 'inquiry', inquiry.inquiry_id);
  await logActivity(req.user.user_id, `Answered inquiry ${inquiry.inquiry_code}`, 'Inquiries');
  res.json(inquiry);
});

// DELETE /api/inquiries/:id  (admin only)
router.delete('/:id', requireRole('admin'), async (req, res) => {
  await pool.query('DELETE FROM inquiries WHERE inquiry_id = $1', [req.params.id]);
  await logActivity(req.user.user_id, `Deleted inquiry #${req.params.id}`, 'Inquiries');
  res.json({ success: true });
});

module.exports = router;
