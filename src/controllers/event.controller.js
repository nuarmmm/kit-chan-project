// src/controllers/event.controller.js
const Event = require('../models/event.model');
const EventModel = require('../models/event.model');

exports.list = async (_req, res, next) => {
  try { res.json(await Event.findAll()); } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const row = await Event.findById(+req.params.id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const row = await Event.create(req.body);
    res.status(201).json(row);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try { res.json(await Event.update(+req.params.id, req.body)); } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try { await Event.remove(+req.params.id); res.json({ ok: true }); } catch (e) { next(e); }
};


