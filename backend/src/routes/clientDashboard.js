const express = require('express');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, requireRole('client'));

// GET /api/client-dashboard  - summary for the logged-in client's home screen
router.get('/', async (req, res) => {
  const clientId = req.user.user_id;

  const [myRequests, upcoming, unansweredInquiries, unreadNotifs, recentRequests, nextAppointment] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS count FROM service_requests WHERE client_id = $1`, [clientId]),
    pool.query(
      `SELECT COUNT(*)::int AS count FROM appointments WHERE client_id = $1 AND appointment_date >= CURRENT_DATE AND status != 'cancelled'`,
      [clientId]
    ),
    pool.query(`SELECT COUNT(*)::int AS count FROM inquiries WHERE client_id = $1 AND status = 'unanswered'`, [clientId]),
    pool.query(`SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE`, [clientId]),
    pool.query(
      `SELECT sr.request_id, sr.request_code, sr.status, sr.created_at, s.service_name
       FROM service_requests sr JOIN services s ON s.service_id = sr.service_id
       WHERE sr.client_id = $1 ORDER BY sr.created_at DESC LIMIT 5`,
      [clientId]
    ),
    pool.query(
      `SELECT a.*, s.service_name FROM appointments a JOIN services s ON s.service_id = a.service_id
       WHERE a.client_id = $1 AND a.appointment_date >= CURRENT_DATE AND a.status != 'cancelled'
       ORDER BY a.appointment_date ASC, a.start_time ASC LIMIT 1`,
      [clientId]
    ),
  ]);

  res.json({
    my_requests: myRequests.rows[0].count,
    upcoming_appointments: upcoming.rows[0].count,
    unanswered_inquiries: unansweredInquiries.rows[0].count,
    unread_notifications: unreadNotifs.rows[0].count,
    recent_requests: recentRequests.rows,
    next_appointment: nextAppointment.rows[0] || null,
  });
});

module.exports = router;
