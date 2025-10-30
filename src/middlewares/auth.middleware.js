// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

function getToken(req) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7);
  if (req.cookies?.token) return req.cookies.token;  // ต้องมี cookie-parser
  if (req.query?.token) return req.query.token;      // ใช้กับ SSE/ช่วง dev
  return null;
}

function auth(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

module.exports = auth;
module.exports.requireRole = requireRole;
