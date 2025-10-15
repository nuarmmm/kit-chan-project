const express = require('express');
const router = express.Router();

// ใช้ mock endpoint สำหรับ frontend
router.get('/all', require('../controllers/category.controller').getAllActivities);
router.get('/:category', require('../controllers/category.controller').getActivitiesByCategory);

module.exports = router;