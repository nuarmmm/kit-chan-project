const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const pool = require('../db');
const Notify = require('../services/notify.service');
const { randomUUID } = require('crypto');
const Notification = require('../models/notification.model');

// หน้าให้แอดมินพิมพ์ประกาศ
router.get('/admin/announce', auth, auth.requireRole('admin'), (req, res) => {
  res.render('admin/announce', { user: req.user, ok: req.query.ok === '1' });
});

// ส่งประกาศถึงผู้ใช้ทั้งหมด
router.post('/admin/notifications/broadcast', auth, auth.requireRole('admin'), async (req, res, next) => {
  try {
    const { title, body, link } = req.body;
    if (!title?.trim()) return res.status(400).send('title is required');

    const broadcastKey = randomUUID(); // ใช้คืนค่าเวลาอยากลบทีหลัง
    const payload = {
      type: 'announcement',
      title: title.trim(),
      body: body?.trim() || '',
      link: link?.trim() || null,
      data: { broadcast_key: broadcastKey }
    };

    await Promise.all([
      Notify.pushToRole(pool, 'user', payload),
      // ถ้าต้องให้ admin ได้ด้วย เปิดบรรทัดนี้:
      // Notify.pushToRole(pool, 'admin', payload)
    ]);

    return res.redirect(`/admin/announce?ok=1&key=${broadcastKey}`);
  } catch (e) { next(e); }
});

router.delete('/admin/notifications/broadcast/:key', auth, auth.requireRole('admin'), async (req, res, next) => {
  try {
    const out = await Notification.removeByBroadcastKey(req.params.key);
    res.json(out); // { deleted: N }
  } catch (e) { next(e); }
});

module.exports = router;
