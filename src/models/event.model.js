// src/models/event.model.js
const pool = require('../db');

exports.findAll = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM events ORDER BY event_date ASC'
  );
  return rows;
};

exports.findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM events WHERE id=$1', [id]);
  return rows[0];
};

exports.create = async ({ title, description, event_date, location, image_url, capacity }) => {
  const { rows } = await pool.query(
    `INSERT INTO events (title, description, event_date, location, image_url, capacity)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [title, description ?? null, event_date, location ?? null, image_url ?? null, capacity ?? 0]
  );
  return rows[0];
};

exports.update = async (id, data) => {
  const { title, description, event_date, location, image_url, capacity } = data;
  const { rows } = await pool.query(
    `UPDATE events SET
       title=COALESCE($1,title),
       description=COALESCE($2,description),
       event_date=COALESCE($3,event_date),
       location=COALESCE($4,location),
       image_url=COALESCE($5,image_url),
       capacity=COALESCE($6,capacity)
     WHERE id=$7 RETURNING *`,
    [title, description, event_date, location, image_url, capacity, id]
  );
  return rows[0];
};

exports.remove = async (id) => {
  await pool.query('DELETE FROM events WHERE id=$1', [id]);
  return { ok: true };
};
