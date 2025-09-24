// src/routes/staffApplication.routes.js
const router = require('express').Router();
const StaffApp = require('../models/staffApplication.model');

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
    res.status(201).json(row);
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
  try { res.json(await StaffApp.update(+req.params.id, req.body)); } catch (err) { next(err); }
});

router.delete('/staff-applications/:id', async (req, res, next) => {
  try { await StaffApp.remove(+req.params.id); res.status(204).end(); } catch (err) { next(err); }
});

module.exports = router;
