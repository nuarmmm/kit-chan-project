const router = require('express').Router();
const Registration = require('../models/registration.model');

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
