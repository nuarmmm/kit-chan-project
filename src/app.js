require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const { setupSwagger } = require('./swagger');
const pool = require('./db');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static & Views
app.use(express.static(path.join(__dirname, 'Public'))); // P ใหญ่ให้ตรงโฟลเดอร์
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/categories', require('./routes/category.routes'));

const staffAppRoutes = require('./routes/staffApplication.routes');
app.use('/api', staffAppRoutes); // ✅ ถูกต้อง

// alias ชั่วคราวถ้า client เก่าเรียก /registrations
app.use('/api/registrations', staffAppRoutes);

// Swagger
setupSwagger(app);

// (ถ้ามี SSR page ค่อยใส่เพิ่มทีหลัง)
// ----- หน้าเว็บ (SSR) -----
app.get("/", (req, res) =>{
  res.render("index")
})
app.get("/events", async (req, res) =>{
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY id');
    res.render("event", { events: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
})
// Error handler (คงไว้)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
