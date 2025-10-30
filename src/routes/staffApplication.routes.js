// src/routes/staffApplication.routes.js
const router = require('express').Router();
const StaffApp = require('../models/staffApplication.model');
const pool = require('../db');                    // ⬅️ เพิ่ม
const Notify = require('../services/notify.service'); // ⬅️ เพิ่ม (ไฟล์ service ตามที่ให้ไว้ก่อนหน้า)


/**
 * @swagger
 * /events/{eventId}/staff-applications:
 *   get:
 *     tags: [StaffApplications]
 *     summary: List staff applications in an event
 *     parameters:
 *       - name: eventId
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *       - name: status
 *         in: query
 *         schema: { type: string, enum: [pending, approved, rejected] }
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Applications (paginated)
 *   post:
 *     tags: [StaffApplications]
 *     summary: Submit staff application to an event
 *     parameters:
 *       - name: eventId
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/StaffApplicationCreate' }
 *     responses:
 *       201:
 *         description: Created
 */

router.get('/events/:eventId/staff-applications', async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    const data = await StaffApp.listByEvent({ eventId: +eventId, status, page, limit });
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/events/:eventId/staff-applications', async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.id ?? null; // ถ้ามี JWT
    const row = await StaffApp.create(+eventId, req.body, userId);

    // ➕ ใหม่ (ใส่ต่อจากบรรทัดข้างบน)
    const { rows: evRows } = await pool.query('SELECT id, title FROM events WHERE id=$1', [+eventId]);
    const ev = evRows[0];

    await Notify.pushToAdmins(pool, { // ใช้เวอร์ชัน pushToAdmins(pool, payload)
      type: 'staff_application_submitted',
      title: `มีใบสมัครสตาฟใหม่`,
      body: `${req.user?.first_name || 'ผู้สมัคร'} สมัครกิจกรรม ${ev?.title || `#${eventId}`}`,
      link: `/admin/events/${eventId}/applicants`,
      data: { eventId: +eventId, applicantId: row.id }
    });


    res.status(201).json(row);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /events/{eventId}/staff-applications/{id}:
 *   get:
 *     tags: [StaffApplications]
 *     summary: Get one staff application in an event
 *     parameters:
 *       - { name: eventId, in: path, required: true, schema: { type: integer } }
 *       - { name: id,      in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.get('/events/:eventId/staff-applications/:id', async (req, res, next) => {
  try {
    const eventId = +req.params.eventId;
    const id = +req.params.id;

    const row = await StaffApp.findById(id);
    if (!row || row.event_id !== eventId) {
      return res.status(404).json({ error: 'not_found' });
    }
    res.set('Cache-Control', 'no-store');
    res.json({ data: row }); // หน้า EJS รองรับทั้ง {data:row} และ row ตรงๆ
  } catch (err) { next(err); }
});
/**
 * @swagger
 * /staff-applications/{id}:
 *   get:
 *     tags: [StaffApplications]
 *     summary: Get one staff application
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer }}]
 *     responses: { 200: { description: "OK" }, 404: { description: "Not found" } }
 *   patch:
 *     tags: [StaffApplications]
 *     summary: Update staff application (e.g., status)
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer }}]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/StaffApplicationUpdate' } } }
 *     responses: { 200: { description: "Updated" } }
 *   delete:
 *     tags: [StaffApplications]
 *     summary: Delete staff application
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer }}]
 *     responses: { 204: { description: "No Content" } }
 */
router.get('/staff-applications/:id', async (req, res, next) => {
  try {
    const row = await StaffApp.findById(+req.params.id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (err) { next(err); }
});

router.patch('/staff-applications/:id', async (req, res, next) => {
  try {
    const id = +req.params.id;

    // ดึงข้อมูลเดิมก่อนอัปเดต
    const before = await StaffApp.findById(id);

    // อัปเดต
    const updated = await StaffApp.update(id, req.body);

    // ถ้ามีการส่ง status มา และสถานะเปลี่ยนจริง → แจ้งผู้สมัคร
    if (before && 'status' in req.body && before.status !== updated.status) {
      const { rows: evRows } = await pool.query('SELECT id, title FROM events WHERE id=$1', [updated.event_id]);
      const ev = evRows[0];

      await Notify.pushToUser(updated.user_id, {
        type: 'staff_status_changed',
        title: `สถานะใบสมัครกิจกรรม ${ev?.title || `#${updated.event_id}`}`,
        body: `สถานะของคุณ: ${updated.status}`,   // เช่น approved | rejected | pending
        link: `/profile`,
        data: { eventId: updated.event_id, status: updated.status, applicationId: updated.id }
      });
    }

    res.json(updated);
  } catch (err) { next(err); }
});


router.delete('/staff-applications/:id', async (req, res, next) => {
  try { await StaffApp.remove(+req.params.id); res.status(204).end(); } catch (err) { next(err); }
});

module.exports = router;
