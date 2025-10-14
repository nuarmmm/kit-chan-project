const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

async function register(req, res) { /* ... */ }
async function login(req, res)    { /* ... */ }
async function me(req, res)       { return res.json({ user: req.user }); }

module.exports = { register, login, me };
