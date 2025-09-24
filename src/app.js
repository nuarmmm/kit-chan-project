require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const { setupSwagger } = require('./swagger');
const pool = require('./db'); // <- ใช้ดึงกิจกรรมจาก DB

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ----- Static & Views -----
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // <-- สำคัญ

// ----- API (คงเดิม) -----
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/registrations', require('./routes/registration.routes'));

// ----- Swagger -----
setupSwagger(app);

// ----- หน้าเว็บ (SSR) -----
app.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, title, description, event_date, location, capacity, image_url, created_at
      FROM events
      ORDER BY created_at DESC
      LIMIT 12
    `);
    res.render('index', {
      title: 'กิจกรรมคณะ IT',
      activities: rows,
      categories: ['วิชาการ','กีฬาและนันทนาการ','บำเพ็ญประโยชน์','ส่งเสริมศิลปวัฒนธรรม'],
      logoText: 'กิจกรรมคณะ IT',
      navLinks: [                                     // เพิ่ม
    { href: '/', label: 'หน้าแรก' },
    { href: '#', label: 'โมดูลส์' },
    { href: '/api/events', label: 'กิจกรรมทั้งหมด (JSON)' }
  ]
    });
  } catch (err) { next(err); }
});

// ----- Error handler -----
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    details: err.details || [],
  });
});

module.exports = app; // listen อยู่ที่ server.js
