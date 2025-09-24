// src/routes/user.routes.js
const router = require('express').Router();
const Users = require('../models/user.model');

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List users
 *     responses: { 200: { description: "OK" } }
 *   post:
 *     tags: [Users]
 *     summary: Create user (register)
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/UserCreate' } } }
 *     responses: { 201: { description: "Created" } }
 */
router.get('/', async (_req, res, next) => {
  try { res.json(await Users.findAll()); } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try { res.status(201).json(await Users.create(req.body)); } catch (e) { next(e); }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by id
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer }}]
 *     responses: { 200: { description: "OK" }, 404: { description: "Not found" } }
 *   patch:
 *     tags: [Users]
 *     summary: Update user
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer }}]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/UserUpdate' } } }
 *     responses: { 200: { description: "Updated" } }
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer }}]
 *     responses: { 204: { description: "No Content" } }
 */
router.get('/:id', async (req, res, next) => {
  try {
    const row = await Users.findById(+req.params.id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try { res.json(await Users.update(+req.params.id, req.body)); } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try { await Users.remove(+req.params.id); res.status(204).end(); } catch (e) { next(e); }
});

module.exports = router;
