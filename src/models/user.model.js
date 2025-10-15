// src/models/user.model.js
const pool = require('../db');
const bcrypt = require('bcryptjs');

const ROUNDS = Number(process.env.BCRYPT_ROUNDS || 8);
const normEmail = e => String(e||'').trim().toLowerCase();
const USER_SAFE =
  `id, first_name, last_name,
   (COALESCE(first_name,'') || ' ' || COALESCE(last_name,'')) AS full_name,
   email, role, created_at`;

exports.findAll = async () => {
  const { rows } = await pool.query(`SELECT ${USER_SAFE} FROM users ORDER BY id ASC`);
  return rows;
};
exports.findById = async (id) => {
  const { rows } = await pool.query(`SELECT ${USER_SAFE} FROM users WHERE id=$1`, [id]);
  return rows[0];
};
exports.findByEmail = async (email) => {
  const { rows } = await pool.query(`SELECT ${USER_SAFE} FROM users WHERE LOWER(email)=LOWER($1)`, [email]);
  return rows[0];
};
exports.findAuthByEmail = async (email) => {
  const { rows } = await pool.query(
    `SELECT ${USER_SAFE}, password_hash FROM users WHERE LOWER(email)=LOWER($1)`,
    [email]
  );
  return rows[0];
};
exports.create = async ({ first_name, last_name, email, password, role='user' }) => {
  const emailNorm = normEmail(email);
  const hash = await bcrypt.hash(password, ROUNDS);
  const { rows } = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING ${USER_SAFE}`,
    [first_name, last_name, emailNorm, hash, role]
  );
  return rows[0];
};
exports.update = async (id, data) => {
  const fields = [], vals = [];
  if (data.email !== undefined) data.email = normEmail(data.email);
  ['first_name','last_name','email','role'].forEach(k=>{
    if (data[k] !== undefined){ vals.push(data[k]); fields.push(`${k}=$${vals.length}`); }
  });
  if (data.password){
    const hash = await bcrypt.hash(data.password, ROUNDS);
    vals.push(hash); fields.push(`password_hash=$${vals.length}`);
  }
  if (!fields.length) return exports.findById(id);
  vals.push(id);
  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id=$${vals.length} RETURNING ${USER_SAFE}`,
    vals
  );
  return rows[0];
};
exports.remove = async (id) => { await pool.query('DELETE FROM users WHERE id=$1',[id]); return { ok:true }; };
