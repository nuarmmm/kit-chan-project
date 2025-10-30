const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const pool = require('../db');
const Notify = require('../services/notify.service');

// หน้าให้แอดมินพิมพ์ประกาศ
router.get('/admin/announce', auth, auth.requireRole('admin'), (req, res) => {
  res.render('admin/announce', { user: req.user, ok: req.query.ok === '1' });
});

// ส่งประกาศถึงผู้ใช้ทั้งหมด
router.post('/admin/notifications/broadcast', auth, auth.requireRole('admin'), async (req, res, next) => {
  try {
    const { title, body, link } = req.body;
    if (!title?.trim()) return res.status(400).send('title is required');

    await Notify.pushToAllUsers(pool, {
      type: 'announcement',
      title: title.trim(),
      body: body?.trim() || '',
      link: link?.trim() || null,
      data: {}
    });

    // ถ้าส่งมาจากฟอร์ม HTML ให้ redirect กลับพร้อมข้อความสำเร็จ
    if (req.headers.accept?.includes('text/html')) return res.redirect('/admin/announce?ok=1');
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
