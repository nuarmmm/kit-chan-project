const router = require('express').Router();
const Registration = require('../models/registration.model');

/**
 * @swagger
 * /registrations:
 *   get:
 *     tags: [Registrations]
 *     summary: List registrations (filter by user/event)
 *     parameters:
 *       - name: user
 *         in: query
 *         schema: { type: string }
 *         description: Filter by user id
 *       - name: event
 *         in: query
 *         schema: { type: string }
 *         description: Filter by event id
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: List registrations (paginated)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Registration' }
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 pages: { type: integer }
 *
 *   post:
 *     tags: [Registrations]
 *     summary: Create registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegistrationCreate' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Registration' }
 *       400: { description: Bad request }
 */

/**
 * @swagger
 * /registrations/{id}:
 *   get:
 *     tags: [Registrations]
 *     summary: Get registration by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Registration
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Registration' }
 *       404: { description: Not found }
 *
 *   put:
 *     tags: [Registrations]
 *     summary: Update registration
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
 *             type: object
 *             description: Fields to update (e.g., status)
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Registration' }
 *       404: { description: Not found }
 *
 *   delete:
 *     tags: [Registrations]
 *     summary: Delete registration
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: No Content }
 *       404: { description: Not found }
 */


// LIST with filter by user/event
router.get('/', async (req, res) => {
  const { user, event, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (user) filter.user = user;
  if (event) filter.event = event;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Registration.find(filter).populate('user').populate('event').skip(skip).limit(Number(limit)),
    Registration.countDocuments(filter)
  ]);

  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// GET one
router.get('/:id', async (req, res) => {
  const reg = await Registration.findById(req.params.id).populate('user').populate('event');
  if (!reg) return res.status(404).json({ message: 'Registration not found' });
  res.json(reg);
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const reg = await Registration.create(req.body); // { user, event, status? }
    res.status(201).json(reg);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  const reg = await Registration.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!reg) return res.status(404).json({ message: 'Registration not found' });
  res.json(reg);
});

// DELETE
router.delete('/:id', async (req, res) => {
  const reg = await Registration.findByIdAndDelete(req.params.id);
  if (!reg) return res.status(404).json({ message: 'Registration not found' });
  res.status(204).end();
});

module.exports = router;
