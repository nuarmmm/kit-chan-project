// src/models/event.model.js
const pool = require('../db');

exports.findAll = async () => {
  const { rows } = await pool.query(`
    SELECT
      e.*,
      COALESCE(ARRAY_REMOVE(ARRAY_AGG(i.image_url ORDER BY i.sort_order), NULL), '{}') AS images
    FROM events e
    LEFT JOIN event_images i ON i.event_id = e.id
    GROUP BY e.id
    ORDER BY e.start_at ASC
  `);
  return rows;
};

exports.findById = async (id) => {
  const { rows } = await pool.query(`
    SELECT
      e.*,
      COALESCE(ARRAY_REMOVE(ARRAY_AGG(i.image_url ORDER BY i.sort_order), NULL), '{}') AS images
    FROM events e
    LEFT JOIN event_images i ON i.event_id = e.id
    WHERE e.id = $1
    GROUP BY e.id
  `, [id]);
  return rows[0];
};

exports.create = async (data) => {
  const {
    title, description,
    start_at, end_at,
    reg_open_at, reg_close_at,
    organizer, registration_url,
    location, capacity,
    is_published = false,
    image_url,
    images = [],
  } = data;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [event] } = await client.query(
      `
      INSERT INTO events
        (title, description, start_at, end_at, reg_open_at, reg_close_at,
         organizer, registration_url, location, capacity, is_published, image_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
      `,
      [
        title, description ?? null, start_at, end_at ?? null,
        reg_open_at ?? null, reg_close_at ?? null,
        organizer ?? null, registration_url ?? null,
        location ?? null, capacity ?? 0,
        is_published ?? false, image_url ?? null,
      ]
    );

    for (let i = 0; i < images.length; i++) {
      await client.query(
        `INSERT INTO event_images (event_id, image_url, sort_order) VALUES ($1,$2,$3)`,
        [event.id, images[i], i]
      );
    }

    const { rows: [full] } = await client.query(
      `
      SELECT e.*, COALESCE(ARRAY_REMOVE(ARRAY_AGG(i.image_url ORDER BY i.sort_order), NULL), '{}') AS images
      FROM events e LEFT JOIN event_images i ON i.event_id = e.id
      WHERE e.id = $1 GROUP BY e.id
      `,
      [event.id]
    );

    await client.query('COMMIT');
    return full;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

exports.update = async (id, data) => {
  const allowed = [
    'title','description','start_at','end_at','reg_open_at','reg_close_at',
    'organizer','registration_url','location','capacity','is_published','image_url'
  ];
  const fields = [];
  const vals = [];
  allowed.forEach(k => {
    if (data[k] !== undefined) {
      vals.push(data[k]);
      fields.push(`${k} = $${vals.length}`);
    }
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (fields.length) {
      vals.push(id);
      await client.query(
        `UPDATE events SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${vals.length}`,
        vals
      );
    }

    if (Array.isArray(data.images)) {
      await client.query(`DELETE FROM event_images WHERE event_id = $1`, [id]);
      for (let i = 0; i < data.images.length; i++) {
        await client.query(
          `INSERT INTO event_images (event_id, image_url, sort_order) VALUES ($1,$2,$3)`,
          [id, data.images[i], i]
        );
      }
    }

    const { rows } = await client.query(
      `
      SELECT e.*, COALESCE(ARRAY_REMOVE(ARRAY_AGG(i.image_url ORDER BY i.sort_order), NULL), '{}') AS images
      FROM events e LEFT JOIN event_images i ON i.event_id = e.id
      WHERE e.id = $1 GROUP BY e.id
      `,
      [id]
    );

    await client.query('COMMIT');
    return rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

exports.remove = async (id) => {
  await pool.query('DELETE FROM events WHERE id=$1', [id]);
  return { ok: true };
};
