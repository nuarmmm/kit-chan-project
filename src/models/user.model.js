// src/models/user.model.js
const pool = require('../db');

exports.findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM users ORDER BY id ASC');
  return rows;
};

exports.findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
  return rows[0];
};

exports.create = async ({ name, email, password, role = 'student' }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [name, email, password, role]
  );
  return rows[0];
};

exports.update = async (id, { name, email, password, role }) => {
  const { rows } = await pool.query(
    `UPDATE users SET
       name=COALESCE($1,name),
       email=COALESCE($2,email),
       password=COALESCE($3,password),
       role=COALESCE($4,role)
     WHERE id=$5 RETURNING *`,
    [name, email, password, role, id]
  );
  return rows[0];
};

exports.remove = async (id) => {
  await pool.query('DELETE FROM users WHERE id=$1', [id]);
  return { ok: true };
};

exports.findByEmail = async (email) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  return rows[0];
};

