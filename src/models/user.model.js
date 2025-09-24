// src/models/user.model.js
const pool = require('../db');
const bcrypt = require('bcryptjs');

exports.findAll = async () => {
  const { rows } = await pool.query(
    `SELECT id, first_name, last_name, full_name, email, role, created_at
     FROM users ORDER BY id ASC`
  );
  return rows;
};

exports.findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, first_name, last_name, full_name, email, role, created_at
     FROM users WHERE id=$1`,
    [id]
  );
  return rows[0];
};

exports.create = async ({ first_name, last_name, email, password, role = 'user' }) => {
  const password_hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, first_name, last_name, full_name, email, role, created_at`,
    [first_name, last_name, email, password_hash, role]
  );
  return rows[0];
};

exports.update = async (id, data) => {
  const fields = [];
  const vals = [];

  ['first_name','last_name','email','role'].forEach((k) => {
    if (data[k] !== undefined) {
      vals.push(data[k]);
      fields.push(`${k} = $${vals.length}`);
    }
  });

  if (data.password) {
    const hash = await bcrypt.hash(data.password, 10);
    vals.push(hash);
    fields.push(`password_hash = $${vals.length}`);
  }

  // ถ้าไม่มีอะไรให้แก้ ก็คืนค่าปัจจุบัน
  if (!fields.length) {
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, full_name, email, role, created_at
       FROM users WHERE id=$1`,
      [id]
    );
    return rows[0];
  }

  vals.push(id);
  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id=$${vals.length}
     RETURNING id, first_name, last_name, full_name, email, role, created_at`,
    vals
  );
  return rows[0];
};

exports.remove = async (id) => {
  await pool.query('DELETE FROM users WHERE id=$1', [id]);
  return { ok: true };
};
