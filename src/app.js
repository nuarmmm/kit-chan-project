// app.js
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const { setupSwagger } = require('./swagger');

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));
  
app.use(express.json());
app.use(morgan('dev'));

app.use('/static', express.static(path.join(__dirname, 'public')));

// ----- Mount routes -----
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api', require('./routes/staffApplication.routes')); // <- รวม path ของใบสมัครสตาฟ

app.use('/api/auth', require('./routes/auth.routes'));

// ----- Swagger UI -----
setupSwagger(app);

app.use((req, res, _next) => {
  res.status(404).json({ message: 'Not found', path: req.originalUrl });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    details: err.details || [],
  });
});

module.exports = app;


