// src/models/staffApplication.model.js
const pool = require('../db');

exports.listByEvent = async ({ eventId, status, page = 1, limit = 10 }) => {
  const where = ['event_id = $1'];
  const params = [eventId];
  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }
  const whereSql = `WHERE ${where.join(' AND ')}`;

  const totalRes = await pool.query(`SELECT COUNT(*)::int AS cnt FROM staff_applications ${whereSql}`, params);
  const total = totalRes.rows[0].cnt;
  const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const offset = (Number(page) - 1) * limitNum;

  const listRes = await pool.query(
    `SELECT *
     FROM staff_applications
     ${whereSql}
     ORDER BY applied_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limitNum, offset]
  );

  return { items: listRes.rows, total, page: Number(page), pages: Math.ceil(total / limitNum) };
};

exports.findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM staff_applications WHERE id=$1', [id]);
  return rows[0];
};

exports.create = async (eventId, payload, userId = null) => {
  const {
    first_name, last_name, nickname, phone, major, cohort,
    student_code, title, email, position_applied, experience,
    motivation, portfolio_url, resume_s3_url
  } = payload;

  const { rows } = await pool.query(
    `INSERT INTO staff_applications
     (event_id, user_id, first_name, last_name, nickname, phone, major, cohort, student_code, title,
      status, applied_at, 
      email, position_applied, experience, motivation, portfolio_url, resume_s3_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending',DEFAULT,$11,$12,$13,$14,$15,$16)
     RETURNING *`,
    [eventId, userId, first_name, last_name, nickname ?? null, phone ?? null, major ?? null, cohort ?? null,
      student_code ?? null, title ?? null, email ?? null, position_applied ?? null, experience ?? null,
      motivation ?? null, portfolio_url ?? null, resume_s3_url ?? null]
  );
  return rows[0];
};

exports.update = async (id, data) => {
  const fields = [];
  const vals = [];
  const allowed = [
    'status','first_name','last_name','nickname','phone','major','cohort',
    'student_code','title','email'
  ];
  allowed.forEach((k) => {
    if (data[k] !== undefined) {
      vals.push(data[k]);
      fields.push(`${k} = $${vals.length}`);
    }
  });
  if (!fields.length) {
    const { rows } = await pool.query('SELECT * FROM staff_applications WHERE id=$1',[id]);
    return rows[0];
  }
  vals.push(id);
  const { rows } = await pool.query(
    `UPDATE staff_applications SET ${fields.join(', ')} WHERE id=$${vals.length} RETURNING *`,
    vals
  );
  return rows[0];
};

exports.remove = async (id) => {
  await pool.query('DELETE FROM staff_applications WHERE id=$1', [id]);
  return { ok: true };
};
