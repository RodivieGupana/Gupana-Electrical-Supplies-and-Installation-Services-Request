const express = require('express');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, requireRole('admin'));

// GET /api/reports/dashboard  - summary numbers + chart data for the admin dashboard
router.get('/dashboard', async (req, res) => {
  const { from, to } = req.query;
  const dateFrom = from || new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  const dateTo = to || new Date().toISOString().slice(0, 10);

  const [totalRequests, pending, confirmedAppts, newInquiries, unreadNotifs, statusBreakdown, requestsOverTime, recentRequests, upcomingAppts] =
    await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM service_requests'),
      pool.query(`SELECT COUNT(*)::int AS count FROM service_requests WHERE status = 'pending'`),
      pool.query(`SELECT COUNT(*)::int AS count FROM appointments WHERE status = 'confirmed'`),
      pool.query(`SELECT COUNT(*)::int AS count FROM inquiries WHERE status = 'unanswered'`),
      pool.query(`SELECT COUNT(*)::int AS count FROM notifications WHERE is_read = FALSE`),
      pool.query(`SELECT status, COUNT(*)::int AS count FROM service_requests GROUP BY status`),
      pool.query(
        `SELECT created_at::date AS day, COUNT(*)::int AS count
         FROM service_requests WHERE created_at::date BETWEEN $1 AND $2
         GROUP BY day ORDER BY day ASC`,
        [dateFrom, dateTo]
      ),
      pool.query(
        `SELECT sr.request_id, sr.request_code, sr.status, sr.created_at, u.full_name AS client_name, s.service_name
         FROM service_requests sr JOIN users u ON u.user_id = sr.client_id JOIN services s ON s.service_id = sr.service_id
         ORDER BY sr.created_at DESC LIMIT 5`
      ),
      pool.query(
        `SELECT a.appointment_id, a.appointment_date, a.start_time, a.end_time, a.status, u.full_name AS client_name
         FROM appointments a JOIN users u ON u.user_id = a.client_id
         WHERE a.appointment_date >= CURRENT_DATE
         ORDER BY a.appointment_date ASC, a.start_time ASC LIMIT 5`
      ),
    ]);

  res.json({
    total_requests: totalRequests.rows[0].count,
    pending_requests: pending.rows[0].count,
    confirmed_appointments: confirmedAppts.rows[0].count,
    new_inquiries: newInquiries.rows[0].count,
    unread_notifications: unreadNotifs.rows[0].count,
    status_breakdown: statusBreakdown.rows,
    requests_over_time: requestsOverTime.rows,
    recent_requests: recentRequests.rows,
    upcoming_appointments: upcomingAppts.rows,
  });
});

// GET /api/reports/generate?type=service_requests|appointments|inquiries|activity_logs&from=&to=
router.get('/generate', async (req, res) => {
  const { type, from, to } = req.query;
  const dateFrom = from || '1970-01-01';
  const dateTo = to || new Date().toISOString().slice(0, 10);

  let query;
  switch (type) {
    case 'appointments':
      query = pool.query(
        `SELECT a.appointment_id, a.appointment_date, a.start_time, a.end_time, a.status,
                u.full_name AS client_name, s.service_name
         FROM appointments a JOIN users u ON u.user_id = a.client_id JOIN services s ON s.service_id = a.service_id
         WHERE a.appointment_date BETWEEN $1 AND $2 ORDER BY a.appointment_date DESC`,
        [dateFrom, dateTo]
      );
      break;
    case 'inquiries':
      query = pool.query(
        `SELECT i.inquiry_code, i.subject, i.status, i.created_at, u.full_name AS client_name
         FROM inquiries i JOIN users u ON u.user_id = i.client_id
         WHERE i.created_at::date BETWEEN $1 AND $2 ORDER BY i.created_at DESC`,
        [dateFrom, dateTo]
      );
      break;
    case 'activity_logs':
      query = pool.query(
        `SELECT al.action, al.module, al.created_at, u.full_name AS user_name
         FROM activity_logs al LEFT JOIN users u ON u.user_id = al.user_id
         WHERE al.created_at::date BETWEEN $1 AND $2 ORDER BY al.created_at DESC`,
        [dateFrom, dateTo]
      );
      break;
    case 'service_requests':
    default:
      query = pool.query(
        `SELECT sr.request_code, sr.status, sr.created_at, u.full_name AS client_name, s.service_name
         FROM service_requests sr JOIN users u ON u.user_id = sr.client_id JOIN services s ON s.service_id = sr.service_id
         WHERE sr.created_at::date BETWEEN $1 AND $2 ORDER BY sr.created_at DESC`,
        [dateFrom, dateTo]
      );
  }

  const { rows } = await query;
  res.json({ type: type || 'service_requests', date_from: dateFrom, date_to: dateTo, rows });
});

module.exports = router;
