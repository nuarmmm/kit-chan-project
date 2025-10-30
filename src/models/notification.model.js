const pool = require('../db');

exports.create = async ({ user_id, type, title, body, link, data }) => {
  const { rows } = await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, link, data)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [user_id, type, title, body ?? null, link ?? null, data ?? {}]
  );
  return rows[0];
};

exports.listForUser = async (userId, { unreadOnly, page = 1, limit = 10 } = {}) => {
  const where = ['user_id = $1'];
  const params = [userId];
  if (unreadOnly) where.push('is_read = FALSE');
  const whereSql = `WHERE ${where.join(' AND ')}`;
  const limitNum = Math.min(Math.max(+limit || 10, 1), 100);
  const offset = (Math.max(+page || 1, 1) - 1) * limitNum;

  const { rows } = await pool.query(
    `SELECT * FROM notifications
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT ${limitNum} OFFSET ${offset}`,
    params
  );
  return rows;
};

exports.countUnread = async (userId) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS cnt
     FROM notifications WHERE user_id=$1 AND is_read=FALSE`,
    [userId]
  );
  return rows[0].cnt;
};

exports.markRead = async (userId, id) => {
  const { rows } = await pool.query(
    `UPDATE notifications
     SET is_read=TRUE, read_at=NOW()
     WHERE id=$1 AND user_id=$2
     RETURNING *`,
    [id, userId]
  );
  return rows[0];
};

exports.markAllRead = async (userId) => {
  await pool.query(
    `UPDATE notifications
     SET is_read=TRUE, read_at=NOW()
     WHERE user_id=$1 AND is_read=FALSE`,
    [userId]
  );
  return { ok: true };
};

// เพิ่มต่อจากฟังก์ชันที่มีอยู่
exports.remove = async (userId, id) => {
  const { rows } = await pool.query(
    `DELETE FROM notifications
     WHERE id=$1 AND user_id=$2
     RETURNING id`,
    [id, userId]
  );
  return rows[0]; // ถ้าไม่เจอจะเป็น undefined
};

exports.removeAllForUser = async (userId, { onlyRead = false } = {}) => {
  const cond = onlyRead ? 'AND is_read=TRUE' : '';
  const result = await pool.query(
    `DELETE FROM notifications WHERE user_id=$1 ${cond}`,
    [userId]
  );
  return { deleted: result.rowCount };
};

// (สำหรับ admin ลบแบบ broadcast ด้วย key)
exports.removeByBroadcastKey = async (broadcastKey) => {
  const result = await pool.query(
    `DELETE FROM notifications
     WHERE data ? 'broadcast_key'
       AND data->>'broadcast_key' = $1`,
    [broadcastKey]
  );
  return { deleted: result.rowCount };
};
