const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // สร้าง user
    const user = await User.create({ name, email, password: hashed, role });

    res.status(201).json({
      message: "✅ Registered successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email); // ➡️ ต้องเพิ่มฟังก์ชันใน model
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // สร้าง token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "✅ Login success", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
