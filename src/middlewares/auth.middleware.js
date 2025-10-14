// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

// ตรวจ JWT ทั่วไป
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, email, role, ... }
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// ตรวจ role เพิ่มเติม (เช่น admin/staff)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

module.exports = auth;                 // default export = auth
module.exports.requireRole = requireRole;