require('dotenv').config();
const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const { setupSwagger } = require('./swagger');
const pool = require('./db');

const app = express();
const sessionConfig = {
  secret: 'secret',
  resave: true, // บันทึก session ทุกครั้งที่มีการร้องขอ
  saveUninitialized: true, // บันทึก session ทุกครั้งที่มีการร้องขอ โดยไม่คำนึงว่า session จะมีข้อมูลหรือไม่
  maxAge: 3600,
};
// หลังจาก require ต่างๆ
const eventRoutes = require('./routes/event.routes');

app.use(session(sessionConfig));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
// app.js
app.use('/api/auth', require('./routes/auth.routes'));


// Static & Views
app.use(express.static(path.join(__dirname, 'Public'))); // P ใหญ่ให้ตรงโฟลเดอร์
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/categories', require('./routes/category.routes'));
// ✅ เพิ่มบรรทัดนี้ (mount API สมัครสตาฟ)
app.use('/api', require('./routes/staffApplication.routes'));
app.use(require('./routes/staffApplication.web.routes'));
// หลังจากตั้งค่า view engine
// อย่า mount API ที่ /events เพื่อไม่ให้ชนกับ SSR view ของหน้า event
// ใช้เฉพาะ /api/events (ถูก mount ไว้แล้วด้านบน)

// ----- Swagger UI -----
setupSwagger(app);

// (SSR) หน้า event รายการเดียว
app.get("/events/:id", async (req, res) =>{
  try {
    const apiRes = await fetch(`http://localhost:3000/api/events/${req.params.id}`);
    if (!apiRes.ok) return res.status(404).send('ไม่พบกิจกรรม');
    const activity = await apiRes.json();
    res.render('event', { activity });
  } catch (err) {
    res.status(500).send('เกิดข้อผิดพลาด');
  }
});

app.get('/', (req, res) =>{
  res.render('index')
})

app.get('/profile', (req, res) => res.render('profile'));

app.get('/staff-apply/:id', (req, res) => {
  const eventId = req.params.id;
  res.render('Staff-apply', { eventId });
});

app.get('/admin-home', (req, res) => res.render('admin-home'));

// Page to create a new event (add event form)
app.get('/add-event', (req, res) => {
  res.render('add-event');
});

app.get('/login', (req, res) => res.render('Login'));
app.get('/register', (req, res) => res.render('Register'));

// Error handler (คงไว้)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
