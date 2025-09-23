// app.js
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// src/app.js
require('./db'); // ✅ จะหา src/db.js

// ✅ ใช้เส้นทางแบบนี้ (ไม่มี src/ นำหน้า)
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/registrations', require('./routes/registration.routes'));

app.get('/', (_req, res) => res.json({ ok: true, name: 'Kit-Chan API' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
