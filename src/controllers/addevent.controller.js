const Event = require('../models/event.model');
const pool = require('../db');

exports.getAddEventForm = (req, res) => {
  res.render('add-event', {
    title: 'เพิ่มกิจกรรม',
    user: req.user
  });
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, event_date, close_date, location } = req.body;
    
    const newEvent = new Event({
      title,
      description,
      eventDate: event_date,
      closeDate: close_date,
      location,
      coverImage: req.file ? req.file.path : '', // ถ้าใช้ multer สำหรับอัปโหลดไฟล์
      createdBy: req.user._id
    });

    await newEvent.save();
    
    req.flash('success', 'เพิ่มกิจกรรมสำเร็จแล้ว');
    res.redirect('/events');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการเพิ่มกิจกรรม');
    res.redirect('/events/add');
  }
};