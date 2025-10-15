// src/routes/event.routes.js
const router = require('express').Router();
const db = require('../db'); // <-- ใช้ pg pool/client ของคุณ


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
const activitiesMock = require('../mock/activities.mock');

function findActivityById(id) {
  id = Number(id);
  for (const activities of Object.values(activitiesMock)) {
    const found = activities.find(act => act.id === id);
    if (found) return found;
  }
  return null;
}
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
router.get('/:id', (req, res) => {
  const activity = findActivityById(req.params.id);
  if (!activity) return res.status(404).send('ไม่พบกิจกรรม');
  res.render('event', { activity });
});
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


// helpers
function buildOrder(sort = 'event_date') {
  if (!sort) return 'event_date ASC';
  const desc = String(sort).trim().startsWith('-');
  const raw = String(sort).trim().replace(/^-/, '');

  // map ชื่อที่คนชอบใช้ -> ชื่อคอลัมน์จริงใน DB
  const map = {
    createdAt: 'created_at',
    date: 'event_date',
    title: 'title',
    location: 'location',
    capacity: 'capacity',     // ถ้ามีคอลัมน์นี้จริง (ดูจาก INSERT/RETURNING)
    event_date: 'event_date',
    created_at: 'created_at',
    id: 'id',
  };

  const col = map[raw] || 'event_date';   // default ปลอดภัย
  const allowed = ['event_date', 'created_at', 'title', 'location', 'capacity', 'id'];
  const safeCol = allowed.includes(col) ? col : 'event_date';
  return `${safeCol} ${desc ? 'DESC' : 'ASC'}`;
}


// LIST with search/filter/pagination
router.get('/', async (req, res, next) => {
  try {
    const {
      search,       // คำค้น
      from, to,     // YYYY-MM-DD
      page = 1,
      limit = 10,
      sort = 'event_date', // รองรับรูปแบบ -createdAt/-event_date
    } = req.query;

    const where = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      where.push(`(LOWER(title) LIKE LOWER($${params.length}) OR LOWER(location) LIKE LOWER($${params.length}))`);
    }
    if (from) {
      params.push(from);
      where.push(`event_date >= $${params.length}`);
    }
    if (to) {
      params.push(to);
      where.push(`event_date <= $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // total count
    const totalRes = await db.query(`SELECT COUNT(*)::int AS cnt FROM events ${whereSql}`, params);
    const total = totalRes.rows[0].cnt;

    const pageNum = Number(page) || 1;
    const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const orderSql = buildOrder(sort);

    const listParams = [...params, limitNum, offset];
    const listRes = await db.query(
      `SELECT id, title, description, event_date, location, capacity, image_url, created_at
       FROM events
       ${whereSql}
       ORDER BY ${orderSql}
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

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

// GET one
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, title, description, event_date, location, capacity, image_url, created_at
       FROM events WHERE id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Event not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// CREATE (ตอนนี้คุณยิงได้แล้วด้วย event_date)
router.post('/', async (req, res, next) => {
  try {
    const { title, event_date, location, capacity, description, image_url } = req.body;
    const { rows } = await db.query(
      `INSERT INTO events (title, event_date, location, capacity, description, image_url)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, title, description, event_date, location, capacity, image_url, created_at`,
      [title, event_date, location, capacity, description ?? null, image_url ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// UPDATE
router.put('/:id', async (req, res, next) => {
  try {
    // อัปเดตเฉพาะฟิลด์ที่ส่งมา
    const fields = [];
    const vals = [];
    const allowed = ['title', 'event_date', 'location', 'capacity', 'description', 'image_url'];

    allowed.forEach((k) => {
      if (req.body[k] !== undefined) {
        vals.push(req.body[k]);
        fields.push(`${k} = $${vals.length}`);
      }
    });

    if (!fields.length) return res.status(400).json({ message: 'No fields to update' });

    vals.push(req.params.id);

    const { rows } = await db.query(
      `UPDATE events SET ${fields.join(', ')} WHERE id = $${vals.length}
       RETURNING id, title, description, event_date, location, capacity, image_url, created_at`,
      vals
    );
    if (!rows.length) return res.status(404).json({ message: 'Event not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE
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