// src/routes/user.routes.js
const router = require('express').Router();
const Users = require('../models/user.model');
const auth = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Admin-only user management
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user's profile (self)
 *     security:
 *       - bearerAuth: []   # ต้องตรงกับชื่อใน swagger.js
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.get('/me', auth, async (req, res, next) => {
  try {
    const row = await Users.findById(req.user.id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row); // ไม่คืน password/password_hash
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List users (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags: [Users]
 *     summary: Create user (admin only)
 *     description: Admin can create a user. Public registration must use /auth/register.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, password]
 *             properties:
 *               first_name: { type: string, example: Alice }
 *               last_name:  { type: string, example: Doe }
 *               email:      { type: string, example: alice@example.com }
 *               password:   { type: string, example: secret123 }
 *               role:       { type: string, example: user, description: Admin only }
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Missing fields
 *       409:
 *         description: Email exists
 */
router.get('/', auth, requireRole('admin'), async (_req, res, next) => {
  try {
    res.json(await Users.findAll());
  } catch (e) { next(e); }
});

router.post('/', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, role = 'user' } = req.body || {};
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: 'first_name, last_name, email, password required' });
    }
    const user = await Users.create({ first_name, last_name, email, password, role });
    res.status(201).json({ user });
  } catch (e) {
    if (e.code === 'EMAIL_EXISTS') return res.status(409).json({ message: 'Email already exists' });
    next(e);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by id (self or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200: { description: OK }
 *       403: { description: Forbidden }
 *       404: { description: Not found }
 *   patch:
 *     tags: [Users]
 *     summary: Update user (self or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name: { type: string }
 *               last_name:  { type: string }
 *               email:      { type: string }
 *               role:       { type: string, description: Admin only }
 *               password:   { type: string }
 *     responses:
 *       200: { description: Updated }
 *       403: { description: Forbidden }
 *       404: { description: Not found }
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204: { description: No Content }
 *       403: { description: Forbidden }
 */
router.get('/:id', auth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const row = await Users.findById(id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (e) { next(e); }
});

router.patch('/:id', auth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    // เฉพาะ admin เท่านั้นที่แก้ role ได้
    const payload = { ...req.body };
    if (req.user.role !== 'admin' && payload.role !== undefined) {
      delete payload.role;
    }
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const row = await Users.update(id, payload);
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (e) { next(e); }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res, next) => {
  try {
    await Users.remove(Number(req.params.id));
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;
