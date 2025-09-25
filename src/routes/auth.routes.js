const express = require('express');
const router = express.Router();

const { signup, login, me } = require('../src/controllers/auth.controller');
const auth = require('../src/middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: signup a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Alice Doe" }
 *               email:{ type: string, example: "alice@example.com" }
 *               password: { type: string, example: "secret123" }
 *               role: { type: string, example: "student" }
 *     responses:
 *       201: { description: Created }
 *       409: { description: Email exists }
 */
router.post('/signUp', signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:{ type: string, example: "alice@example.com" }
 *               password: { type: string, example: "secret123" }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Invalid credentials }
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile (from JWT)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
router.get('/me', auth, me);

module.exports = router;