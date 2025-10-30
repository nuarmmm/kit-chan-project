require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

const { setupSwagger } = require('./swagger');
const pool = require('./db');

const app = express();
app.use(cookieParser());
app.set('trust proxy', true); // รองรับ proxy/ALB บน EB
app.use(require('./routes/notification.routes'));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(require('./routes/admin.broadcast.web.routes')); // ⬅️ เพิ่ม
app.use(require('./routes/admin.broadcast.web.routes'));

//
// ใกล้ๆ ส่วนบน route อื่นๆ ของ app.js
app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

app.get('/ready', async (_req, res) => {
  try {
    await pool.query('SELECT 1'); // ใช้ pool จาก './db'
    res.status(200).json({ db: 'up' });
  } catch (e) {
    res.status(503).json({ db: 'down', error: e.message });
  }
});


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
// เพิ่มบรรทัดนี้ (mount API สมัครสตาฟ)
app.use('/api', require('./routes/staffApplication.routes'));
app.use(require('./routes/staffApplication.web.routes'));
app.use(require('./routes/adminApplicants.web.routes'));

// app.use(require('./routes/dev.preview.routes'));



// ----- Swagger UI -----
setupSwagger(app);

// (ถ้ามี SSR page ค่อยใส่เพิ่มทีหลัง)
// ----- หน้าเว็บ (SSR) -----
app.get("/", (req, res) =>{
  res.render("index")
})


app.get('/profile', (req, res) => res.render('profile'));

app.get("/events/:id", async (req, res) => {
  const base = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
  try {
    const apiRes = await fetch(`${base}/api/events/${req.params.id}`);
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

app.get('/login', (req, res) => res.render('Login'));
app.get('/register', (req, res) => res.render('Register'));

// Error handler (คงไว้)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
