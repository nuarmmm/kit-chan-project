const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// ---------- helpers ----------
const normEmail = (e) => String(e || '').trim().toLowerCase();

function signToken(payload) {
    if (!process.env.JWT_SECRET) throw new Error('JWT secret is not configured');
    const opts = { expiresIn: '7d' };
    if (process.env.JWT_ISSUER) opts.issuer = process.env.JWT_ISSUER;
    if (process.env.JWT_AUDIENCE) opts.audience = process.env.JWT_AUDIENCE;
    return jwt.sign(payload, process.env.JWT_SECRET, opts);
}

// ---------- controllers (ทรงเดียวกับ event.controller) ----------
exports.register = async (req, res, next) => {
    try {
        let { first_name, last_name, name, email, password } = req.body;

        // รองรับเคสส่ง name เดียวมา → แตกเป็น first/last
        if (name && (!first_name || !last_name)) {
            const parts = String(name).trim().split(/\s+/);
            first_name = first_name || parts.shift() || '';
            last_name = last_name || parts.join(' ');
        }

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ message: 'first_name, last_name, email, password required' });
        }

        email = normEmail(email);

        // กันอีเมลซ้ำ
        const existed = await User.findByEmail(email);
        if (existed) return res.status(409).json({ message: 'Email already exists' });

        // บังคับ role เริ่มต้น (model เองก็ default = 'user')
        const user = await User.create({ first_name, last_name, email, password, role: 'user' });

        return res.status(201).json({ user });
    } catch (e) {
        if (e.code === 'EMAIL_EXISTS') return res.status(409).json({ message: 'Email already exists' });
        return next(e);
    }
};

exports.login = async (req, res, next) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'email, password required' });

        email = normEmail(email);

        // ใช้ helper ใน model ที่คืน password_hash มาด้วย
        const row = await User.findAuthByEmail(email);
        if (!row?.password_hash) return res.status(401).json({ message: 'Invalid credentials' });

        const ok = await bcrypt.compare(password, row.password_hash);
        if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

        const token = signToken({ id: row.id, email: row.email, role: row.role });
        return res.json({ token });
    } catch (e) {
        return next(e);
    }
};

exports.me = async (req, res, next) => {
    try {
        if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });
        // ดึงโปรไฟล์ล่าสุดจาก DB (หรือจะส่ง req.user ตรง ๆ ก็ได้)
        const u = await User.findById(req.user.id);
        return res.json({ user: u || req.user });
    } catch (e) {
        return next(e);
    }
};
