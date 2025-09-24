// app.js
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const { setupSwagger } = require('./swagger');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ----- Mount routes -----
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api', require('./routes/staffApplication.routes')); // <- รวม path ของใบสมัครสตาฟ

// ----- Swagger UI -----
setupSwagger(app);

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


