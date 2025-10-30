const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const Notification = require('../models/notification.model');
const Notify = require('../services/notify.service');

// SSE (ใช้ cookie/token อะไรก็ได้ตามที่ service รองรับ)
router.get('/notifications/stream', Notify.sseHandler);

// REST
router.get('/notifications', auth, async (req, res, next) => {
  try {
    const { unread, page, limit } = req.query;
    const list = await Notification.listForUser(req.user.id, {
      unreadOnly: unread === 'true', page, limit
    });
    res.json(list);
  } catch (e) { next(e); }
});

router.get('/notifications/unread-count', auth, async (req, res, next) => {
  try {
    const count = await Notification.countUnread(req.user.id);
    res.json({ count });
  } catch (e) { next(e); }
});

router.patch('/notifications/:id/read', auth, async (req, res, next) => {
  try {
    const row = await Notification.markRead(req.user.id, +req.params.id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (e) { next(e); }
});

router.post('/notifications/mark-all-read', auth, async (req, res, next) => {
  try {
    res.json(await Notification.markAllRead(req.user.id));
  } catch (e) { next(e); }
});

// ลบแจ้งเตือนทีละอัน (เฉพาะของตัวเอง)
router.delete('/notifications/:id', auth, async (req, res, next) => {
  try {
    const row = await Notification.remove(req.user.id, +req.params.id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json({ ok: true, id: row.id });
  } catch (e) { next(e); }
});

// ลบแจ้งเตือนทั้งหมดของตัวเอง (ใส่ query onlyRead=true ถ้าจะลบเฉพาะที่อ่านแล้ว)
router.delete('/notifications', auth, async (req, res, next) => {
  try {
    const onlyRead = req.query.onlyRead === 'true';
    const out = await Notification.removeAllForUser(req.user.id, { onlyRead });
    res.json(out); // { deleted: N }
  } catch (e) { next(e); }
});


module.exports = router;
