// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

function getToken(req) {
  const b = req.headers.authorization?.split(' ');
  if (b?.[0] === 'Bearer' && b[1]) return b[1];
  if (req.cookies?.access_token) return req.cookies.access_token;
  return null;
}

// ตรวจ JWT ทั่วไป
function requireAuth(req, res, next) {
  const header = req.get('authorization') || req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = header.slice(7); // ตัด "Bearer "
  try {
    const secret = process.env.JWT_SECRET || 'dev';
    req.user = jwt.verify(token, secret); // { id, email, role, ... }
    return next();
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

// ถอด JWT ถ้ามี (optional) — เอาไว้ใช้กับหน้า SSR
function requireAuthOptional(req, _res, next) {
  const token = getToken(req);
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch {}
  }
  next();
}

module.exports = { requireAuth, requireRole, requireAuthOptional };