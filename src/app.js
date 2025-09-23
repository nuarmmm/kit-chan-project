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
app.use('/api/registrations', require('./routes/registration.routes'));

// ----- Swagger UI -----
setupSwagger(app);

// Error handler (แนะนำให้มีโครงสร้างคงที่)
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    details: err.details || [],
  });
});

module.exports = app; // ถ้ามีไฟล์ server.js ก็ทำ http.createServer(app).listen(...)

