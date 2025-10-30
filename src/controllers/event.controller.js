const Event = require('../models/event.model');

// helpers
const toBool = v => v === true || v === 'true' || v === 1 || v === '1';
const toInt  = v => (v === undefined || v === '' ? null : Number(v));
const clean  = v => (v === '' ? null : v);

exports.list = async (req, res, next) => {
  try {
    // รับทั้ง search/q และ published/is_published
    const q = {
      ...req.query,
      q: req.query.q ?? req.query.search,
      is_published: req.query.is_published ?? req.query.published
    };
    const rows = await Event.findAll(q); // model เวอร์ชันอัปเกรดที่คุยกันก่อนหน้า
    // ให้ตรง API docs -> คืนเป็น “array” ตรง ๆ
    res.json(rows);
  } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const row = await Event.findById(Number(req.params.id));
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    // รองรับทั้ง JSON และ multipart
    const cover   = req.files?.cover?.[0]?.location || req.body.image_url || null;
    const gallery = (req.files?.images || []).map(f => f.location);

    const data = {
      title: req.body.title,
      description: clean(req.body.description),
      start_at: clean(req.body.start_at),
      end_at: clean(req.body.end_at),
      reg_open_at: clean(req.body.reg_open_at),
      reg_close_at: clean(req.body.reg_close_at),
      organizer: clean(req.body.organizer),
      registration_url: clean(req.body.registration_url),
      location: clean(req.body.location),
      capacity: toInt(req.body.capacity) ?? 0,
      is_published: toBool(req.body.is_published),
      image_url: cover,
      images: gallery.length ? gallery : (Array.isArray(req.body.images) ? req.body.images : [])
    };

    const row = await Event.create(data);
    res.status(201).json(row);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const patch = {
      title: req.body.title,
      description: clean(req.body.description),
      start_at: clean(req.body.start_at),
      end_at: clean(req.body.end_at),
      reg_open_at: clean(req.body.reg_open_at),
      reg_close_at: clean(req.body.reg_close_at),
      organizer: clean(req.body.organizer),
      registration_url: clean(req.body.registration_url),
      location: clean(req.body.location),
      capacity: req.body.capacity !== undefined ? toInt(req.body.capacity) : undefined,
      is_published: req.body.is_published !== undefined ? toBool(req.body.is_published) : undefined
    };

    // cover ใหม่
    if (req.files?.cover?.[0]) patch.image_url = req.files.cover[0].location;

    // รวมรูปเดิมที่อยากเก็บ + รูปใหม่ที่เพิ่งอัป
    const keep = Array.isArray(req.body.existing_images)
      ? req.body.existing_images
      : (req.body.existing_images ? [req.body.existing_images] : []);
    const uploaded = (req.files?.images || []).map(f => f.location);
    if (keep.length || uploaded.length) patch.images = [...keep, ...uploaded];

    const row = await Event.update(Number(req.params.id), patch);
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    await Event.remove(Number(req.params.id));
    res.status(204).end();
  } catch (e) { next(e); }
};
