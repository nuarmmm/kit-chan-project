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
const categoryRoutes = require('./routes/category.routes');
app.use('/api/categories', categoryRoutes);

// ----- Swagger -----
setupSwagger(app);

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
