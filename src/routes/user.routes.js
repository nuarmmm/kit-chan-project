const router = require('express').Router();
// const { authMiddleware } = require('../middlewares/auth');

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List users
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/SortParam'
 *     responses:
 *       200:
 *         description: List users (paginated)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *
 *   post:
 *     tags: [Users]
 *     summary: Create user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Not found
 *
 *   patch:
 *     tags: [Users]
 *     summary: Update user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: No Content
 *       404:
 *         description: Not found
 */

// ====== ตัวอย่างโค้ดรูทจริง (ย่อ) ======
router.get('/', async (req, res) => {
  // ... ดึง users + meta
  res.json({ meta: { page: 1, limit: 10, total: 1, pages: 1 }, data: [] });
});

router.post('/', async (req, res) => {
  // ... สร้าง user
  res.status(201).json({ id: 'u_123', name: 'Alice', email: 'alice@example.com' });
});

router.get('/:id', async (req, res) => {
  // ... อ่าน user ตาม id
  res.json({ id: req.params.id, name: 'Alice', email: 'alice@example.com' });
});

router.patch('/:id', /*authMiddleware,*/ async (req, res) => {
  // ... อัปเดต user
  res.json({ id: req.params.id, name: 'Alice Updated', email: 'alice@example.com' });
});

router.delete('/:id', /*authMiddleware,*/ async (req, res) => {
  // ... ลบ user
  res.status(204).send();
});

module.exports = router;

