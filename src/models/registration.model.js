// src/models/registration.model.js
const pool = require('../db');

exports.findAll = async () => {
  const { rows } = await pool.query(
    `SELECT r.*, u.name AS user_name, e.title AS event_title
     FROM registrations r
     JOIN users u ON r.user_id=u.id
     JOIN events e ON r.event_id=e.id
     ORDER BY r.id DESC`
  );
  return rows;
};

exports.create = async ({ user_id, event_id }) => {
  const { rows } = await pool.query(
    `INSERT INTO registrations (user_id, event_id)
     VALUES ($1,$2) RETURNING *`,
    [user_id, event_id]
  );
  return rows[0];
};

exports.remove = async (id) => {
  await pool.query('DELETE FROM registrations WHERE id=$1', [id]);
  return { ok: true };
};
