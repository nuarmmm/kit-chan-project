require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// 1) เชื่อม MongoDB Atlas
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // mongoose v8 ไม่ต้องใส่ options เพิ่ม
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connect error:', err.message);
    process.exit(1);
  }
})();

// 2) สร้าง Model ตัวอย่าง (Activity)
const { Schema, model } = mongoose;
const activitySchema = new Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  note: String,
}, { timestamps: true });
const Activity = model('Activity', activitySchema);

// 3) Routes ทดสอบ
app.get('/', (req, res) => res.send('Kit-Chan API is running'));

app.get('/api/activities', async (req, res) => {
  const items = await Activity.find().sort({ date: 1 });
  res.json(items);
});

app.post('/api/activities', async (req, res) => {
  try {
    const { title, date, note } = req.body;
    const act = await Activity.create({ title, date, note });
    res.status(201).json(act);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// 4) Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
