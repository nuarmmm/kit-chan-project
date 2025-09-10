// scripts/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const Event = require('../src/models/event.model');
const Registration = require('../src/models/registration.model');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ล้างข้อมูลเก่า (กัน duplicate)
    await Promise.all([
      Registration.deleteMany({}),
      Event.deleteMany({}),
      User.deleteMany({})
    ]);

    // เพิ่ม Users
    const users = await User.insertMany([
      { name: 'Alice', email: 'alice@test.local', role: 'student' },
      { name: 'Bob',   email: 'bob@test.local',   role: 'student' },
      { name: 'Admin', email: 'admin@test.local', role: 'admin' }
    ]);
    console.log(`🌱 Users: ${users.length}`);

    // เพิ่ม Events
    const events = await Event.insertMany([
      {
        title: 'อบรม React พื้นฐาน',
        description: 'เริ่มต้นพัฒนาเว็บด้วย React',
        date: new Date('2025-10-05T09:00:00Z'),
        location: 'Lab 401',
        category: 'อบรม'
      },
      {
        title: 'จิตอาสา Big Cleaning',
        description: 'ร่วมทำความสะอาดอาคารเรียน',
        date: new Date('2025-10-10T13:00:00Z'),
        location: 'ตึก IT',
        category: 'บำเพ็ญประโยชน์'
      },
      {
        title: 'สัมมนา AI',
        description: 'อัปเดตเทรนด์ AI',
        date: new Date('2025-10-20T09:30:00Z'),
        location: 'หอประชุมใหญ่',
        category: 'วิชาการ'
      }
    ]);
    console.log(`🌱 Events: ${events.length}`);

    // เพิ่ม Registrations
    const regs = await Registration.insertMany([
      { user: users[0]._id, event: events[0]._id, status: 'registered' },
      { user: users[1]._id, event: events[0]._id, status: 'interested' },
      { user: users[1]._id, event: events[2]._id, status: 'registered' }
    ]);
    console.log(`🌱 Registrations: ${regs.length}`);

    await mongoose.disconnect();
    console.log('✅ Seed finished');
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
}

run();
