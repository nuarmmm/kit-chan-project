const express = require('express');
const router = express.Router();
const pool = require('../db');

const API_BASE = process.env.API_BASE || '/api';

// รายชื่อผู้สมัครของอีเวนต์
router.get('/admin/events/:eventId/applicants', async (req, res, next) => {
  try {
    const eventId = Number(req.params.eventId);
    if (!Number.isInteger(eventId)) return res.status(400).send('eventId ต้องเป็นตัวเลข');

    // ✅ เลือก title โดยตรง ห้ามอ้าง name
    const { rows } = await pool.query('SELECT id, title FROM events WHERE id = $1', [eventId]);
    if (!rows.length) return res.status(404).send('ไม่พบกิจกรรม #' + eventId);

    res.render('admin/applicants', {
      eventId,
      eventName: rows[0].title, // 👈 ใช้ title
      apiUrl: `${API_BASE}/events/${eventId}/staff-applications`,
      apiUrl: `${API_BASE}/events/${eventId}/staff-applications?page=1&limit=50`,
    });
  } catch (err) { next(err); }
});

// รายละเอียดผู้สมัครของอีเวนต์
router.get('/admin/events/:eventId/applicants/:applicantId', async (req, res, next) => {
  try {
    const eventId = Number(req.params.eventId);
    const applicantId = Number(req.params.applicantId);
    if (!Number.isInteger(eventId) || !Number.isInteger(applicantId)) {
      return res.status(400).send('eventId/applicantId ต้องเป็นตัวเลข');
    }

    // ✅ เลือก title โดยตรง
    const { rows } = await pool.query('SELECT id, title FROM events WHERE id = $1', [eventId]);
    if (!rows.length) return res.status(404).send('ไม่พบกิจกรรม #' + eventId);

    res.render('admin/applicant-detail', {
      eventId,
      applicantId,
      eventName: rows[0].title, // 👈 ใช้ title
      apiUrl: `${API_BASE}/events/${eventId}/staff-applications/${applicantId}`,
    });
  } catch (err) { next(err); }
});

module.exports = router;
