require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');             // ✅ เพิ่ม
const jwt = require('jsonwebtoken');
const { requireAuth, requireRole, requireAuthOptional } = require('./middlewares/auth.middleware');

const { setupSwagger } = require('./swagger');
const pool = require('./db');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(methodOverride('_method'));
// app.js
app.use('/api/auth', require('./routes/auth.routes'));

app.use((req, _res, next) => {
  try {
    // ลองอ่านจาก Authorization: Bearer <token>
    let token = req.headers.authorization?.split(' ')[1];
    // ถ้าไม่มี ลองอ่านจาก cookie ชื่อ access_token
    if (!token && req.cookies?.access_token) token = req.cookies.access_token;
    if (token && process.env.JWT_SECRET) {
      req.user = jwt.verify(token, process.env.JWT_SECRET); // {id,email,role,...}
    }
  } catch (_e) { /* เงียบ → ไม่บังคับ login */ }
  next();
});


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
app.use(methodOverride('_method'));
app.use('/api/auth', require('./routes/auth.routes'));



// ----- Swagger UI -----
setupSwagger(app);

// (ถ้ามี SSR page ค่อยใส่เพิ่มทีหลัง)
// ----- หน้าเว็บ(SSR)-----
  // app.get('/', (req, res) => {
  //   const user = req.user || null; // หรือ res.locals.user ถ้าตั้งไว้
  //   const userJSON = JSON.stringify(user).replace(/</g, '\\u003c');
  //   res.render('index', { user, userJSON }); // << สำคัญ ต้องส่งเข้าไป
  // });

app.get('/', requireAuthOptional, (req, res) => {
  const user = req.user || null;
  res.render('index', { user, userJSON: JSON.stringify(user).replace(/</g, '\\u003c') });
});

app.get('/profile', (req, res) => res.render('profile'));

app.get("/events/:id", async (req, res) => {
  try {
    const apiRes = await fetch(`http://localhost:3000/api/events/${req.params.id}`);
    if (!apiRes.ok) return res.status(404).send('ไม่พบกิจกรรม');
    const activity = await apiRes.json();
    res.render('event', { activity });
  } catch (err) {
    res.status(500).send('เกิดข้อผิดพลาด');
  }
});

app.get('/staff-apply/:id', (req, res) => {
  const eventId = req.params.id;
  res.render('Staff-apply', { eventId });
});

app.get('/admin-home', requireAuth, requireRole('admin'), (req, res) => {
  const user = req.user || null;
  const userJSON = JSON.stringify(user).replace(/</g, '\\u003c');
  res.render('admin-home', { user, userJSON });
});

// Page to create a new event (add event form)
app.get('/add-event', requireAuth, requireRole('admin'), (req, res) => {
  const user = req.user || null;
  const userJSON = JSON.stringify(user).replace(/</g, '\\u003c');
  res.render('add-event', { user, userJSON });
});

app.get('/login', (req, res) => res.render('Login'));
app.get('/register', (req, res) => res.render('Register'));

// Error handler (คงไว้)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
