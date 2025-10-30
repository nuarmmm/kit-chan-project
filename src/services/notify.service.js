const jwt = require('jsonwebtoken');
const Notification = require('../models/notification.model');

const clients = new Map(); // Map<userId, Set<res>>

function cookieToken(req) {
  try {
    // ต้องมี cookie-parser ใน app.js แล้ว
    if (req.cookies?.token) return req.cookies.token;
  } catch {}
  return null;
}

function headerToken(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

function queryToken(req) {
  return req.query?.token || null;
}

function getToken(req) {
  return headerToken(req) || cookieToken(req) || queryToken(req);
}

function addClient(userId, res) {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId).add(res);
  res.on('close', () => {
    clients.get(userId)?.delete(res);
    if (!clients.get(userId)?.size) clients.delete(userId);
  });
}

function push(userId, payload) {
  const set = clients.get(userId);
  if (!set) return;
  const data = `event: notification\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of set) { try { res.write(data); } catch {}
  }
}

exports.sseHandler = (req, res) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).end();
    const user = jwt.verify(token, process.env.JWT_SECRET); // { id, role, email, ... }

    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    res.flushHeaders();

    addClient(user.id, res);
    res.write(`event: hello\ndata: {"ok":true}\n\n`);
    const ping = setInterval(() => res.write(`event: ping\ndata: {}\n\n`), 25000);
    res.on('close', () => clearInterval(ping));
  } catch {
    res.status(401).end();
  }
};

exports.pushToUser = async (userId, payload) => {
  const row = await Notification.create({ user_id: userId, ...payload });
  push(userId, { row });
  return row;
};

exports.pushToAdmins = async (pool, payload) => {
  const { rows } = await pool.query(`SELECT id FROM users WHERE role='admin'`);
  for (const r of rows) await exports.pushToUser(r.id, payload);
};

// notify.service.js
exports.pushToRole = async (pool, role, payload) => {
  const { rows } = await pool.query(`SELECT id FROM users WHERE role = $1`, [role]);
  for (const r of rows) await exports.pushToUser(r.id, payload); // ← แถวต่อ user
};

exports.pushToAllUsers = async (pool, payload) => {
  return exports.pushToRole(pool, 'user', payload);
};

