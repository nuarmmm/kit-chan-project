const router = require('express').Router();

// เข้าหน้ากรอกใบสมัคร (เช่นมาจากปุ่ม "สมัครสตาฟ" ในหน้ากิจกรรม)
router.get('/events/:eventId/staff-apply', (req, res) => {
  res.render('staff-apply', {
    title: 'สมัครสตาฟ',
    eventId: Number(req.params.eventId),
    apiBase: process.env.API_BASE || '/api'
  });
});

module.exports = router;
