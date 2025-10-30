const router = require('express').Router();
const EventModel = require('../models/event.model'); // ปรับ path ให้ตรงโปรเจ็กต์

router.get('/events/:eventId/staff-apply', async (req, res, next) => {
  try {
    const eventId = Number(req.params.eventId);
    const ev = await EventModel.findById(eventId);   // ← ควรคืน { id, title, subtitle/theme, ... }
    if (!ev) return res.status(404).send('Event not found');

    res.render('staff-apply', {
      title: `สมัครสตาฟ — ${ev.title}`,
      eventId,
      apiBase: process.env.API_BASE || '/api',
      event: ev,                                     // ส่งเข้า EJS
    });
  } catch (e) { next(e); }
});

module.exports = router;
