const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const upload = require('../config/multer'); // การตั้งค่า multer สำหรับอัปโหลดภาพ
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { createEvent } = require('../controllers/events.controller');

router.get('/add', requireAuth, eventController.getAddEventForm);
router.post('/add', requireAuth, upload.single('cover'), eventController.createEvent);

router.post('/api/events', upload.single('cover'), createEvent);

module.exports = router;