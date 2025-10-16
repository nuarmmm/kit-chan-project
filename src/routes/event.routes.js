// src/routes/event.routes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // pg Pool

/**
 * @swagger
 * /events:
 *   get:
 *     tags: [Events]
 *     summary: List events (with filters)
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/FromParam'
 *       - $ref: '#/components/parameters/ToParam'
 *       - $ref: '#/components/parameters/RegFromParam'
 *       - $ref: '#/components/parameters/RegToParam'
 *       - $ref: '#/components/parameters/PublishedParam'
 *       - $ref: '#/components/parameters/SortParam'
 *     responses:
 *       200:
 *         description: List events (paginated)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Event' }
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 pages: { type: integer }
 *
 *   post:
 *     tags: [Events]
 *     summary: Create event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EventCreate' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Event' }
 */

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Get event by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Event' }
 *       404: { description: Not found }
 *
 *   put:
 *     tags: [Events]
 *     summary: Update event
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EventUpdate' }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Event' }
 *       404: { description: Not found }
 *
 *   delete:
 *     tags: [Events]
 *     summary: Delete event
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: No Content }
 *       404: { description: Not found }
 */

// ===== helper: safe order by =====
function buildOrder(sort = 'start_at') {
  if (!sort) return 'start_at ASC';
  const desc = String(sort).trim().startsWith('-');
  const raw  = String(sort).trim().replace(/^-/, '');
  const map = {
    start_at: 'start_at',
    end_at: 'end_at',
    reg_open_at: 'reg_open_at',
    reg_close_at: 'reg_close_at',
    created_at: 'created_at',
    createdAt: 'created_at',
    title: 'title',
    location: 'location',
    capacity: 'capacity',
    id: 'id',
  };
  const allowed = Object.values(map);
  const col = map[raw] || 'start_at';
  const safeCol = allowed.includes(col) ? col : 'start_at';
  return `${safeCol} ${desc ? 'DESC' : 'ASC'}`;
}

// ===== LIST (search/filter/pagination + images[]) =====
router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      from, to,               // filter by start_at (YYYY-MM-DD)
      reg_from, reg_to,       // filter by registration window
      published,              // 'true' | 'false'
      page = 1,
      limit = 10,
      sort = 'start_at',
    } = req.query;

    const where = [];
    const params = [];
    const add = (sql, val) => { params.push(val); where.push(sql.replace('?', `$${params.length}`)); };

    if (search) {
      add(`(LOWER(e.title) LIKE LOWER(?) OR LOWER(e.location) LIKE LOWER(?))`, `%${search}%`);
      params.push(`%${search}%`); // สำหรับ location (ตัวที่สอง)
    }
    if (from)      add(`e.start_at >= ?::timestamptz`, from);
    if (to)        add(`e.start_at <= ?::timestamptz`, to);
    if (reg_from)  add(`e.reg_open_at >= ?::timestamptz`, reg_from);
    if (reg_to)    add(`e.reg_close_at <= ?::timestamptz`, reg_to);
    if (published !== undefined) add(`e.is_published = ?`, String(published) === 'true');

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // total
    const totalRes = await db.query(`SELECT COUNT(*)::int AS cnt FROM events e ${whereSql}`, params);
    const total = totalRes.rows[0].cnt;

    const pageNum  = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const offset   = (pageNum - 1) * limitNum;
    const orderSql = buildOrder(sort);

    const listParams = [...params, limitNum, offset];
    const limitIdx  = params.length + 1;
    const offsetIdx = params.length + 2;

    const sql = `
      SELECT
        e.id, e.title, e.description,
        e.start_at, e.end_at,
        e.reg_open_at, e.reg_close_at,
        e.organizer, e.registration_url,
        e.location, e.capacity, e.is_published,
        e.image_url,
        e.created_at, e.updated_at,
        COALESCE(ARRAY_REMOVE(ARRAY_AGG(i.image_url ORDER BY i.sort_order), NULL), '{}') AS images
      FROM events e
      LEFT JOIN event_images i ON i.event_id = e.id
      ${whereSql}
      GROUP BY e.id
      ORDER BY ${orderSql}
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;
    const listRes = await db.query(sql, listParams);

    res.json({
      items: listRes.rows,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
});

// ===== GET one (+images[]) =====
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `
      SELECT
        e.id, e.title, e.description,
        e.start_at, e.end_at,
        e.reg_open_at, e.reg_close_at,
        e.organizer, e.registration_url,
        e.location, e.capacity, e.is_published,
        e.image_url,
        e.created_at, e.updated_at,
        COALESCE(ARRAY_REMOVE(ARRAY_AGG(i.image_url ORDER BY i.sort_order), NULL), '{}') AS images
      FROM events e
      LEFT JOIN event_images i ON i.event_id = e.id
      WHERE e.id = $1
      GROUP BY e.id
      `,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Event not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ===== CREATE (รองรับ images[]) =====
router.post('/', async (req, res, next) => {
  const {
    title, description,
    start_at, end_at,
    reg_open_at, reg_close_at,
    organizer, registration_url,
    location, capacity,
    is_published = false,
    image_url,
    images = [],
  } = req.body;

  const client = await db.connect();
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
        title,
        description ?? null,
        start_at,
        end_at ?? null,
        reg_open_at ?? null,
        reg_close_at ?? null,
        organizer ?? null,
        registration_url ?? null,
        location ?? null,
        capacity ?? 0,
        is_published ?? false,
        image_url ?? null,
      ]
    );

    if (Array.isArray(images) && images.length) {
      for (let i = 0; i < images.length; i++) {
        await client.query(
          `INSERT INTO event_images (event_id, image_url, sort_order) VALUES ($1,$2,$3)`,
          [event.id, images[i], i]
        );
      }
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
    res.status(201).json(full);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// ===== UPDATE (patch fields; ถ้า body มี images[] จะ replace ทั้งชุด) =====
router.put('/:id', async (req, res, next) => {
  const allowed = [
    'title','description','start_at','end_at','reg_open_at','reg_close_at',
    'organizer','registration_url','location','capacity','is_published','image_url'
  ];
  const fields = [];
  const vals = [];
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) {
      vals.push(req.body[k]);
      fields.push(`${k} = $${vals.length}`);
    }
  });

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    if (fields.length) {
      vals.push(req.params.id);
      await client.query(
        `UPDATE events SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${vals.length}`,
        vals
      );
    }

    if (Array.isArray(req.body.images)) {
      await client.query(`DELETE FROM event_images WHERE event_id = $1`, [req.params.id]);
      for (let i = 0; i < req.body.images.length; i++) {
        await client.query(
          `INSERT INTO event_images (event_id, image_url, sort_order) VALUES ($1,$2,$3)`,
          [req.params.id, req.body.images[i], i]
        );
      }
    }

    const { rows } = await client.query(
      `
      SELECT e.*, COALESCE(ARRAY_REMOVE(ARRAY_AGG(i.image_url ORDER BY i.sort_order), NULL), '{}') AS images
      FROM events e LEFT JOIN event_images i ON i.event_id = e.id
      WHERE e.id = $1 GROUP BY e.id
      `,
      [req.params.id]
    );
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Event not found' });
    }

    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// ===== DELETE (event_images ถูกลบเพราะ ON DELETE CASCADE) =====
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await db.query('DELETE FROM events WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Event not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
