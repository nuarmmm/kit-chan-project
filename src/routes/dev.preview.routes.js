// const express = require('express');
// const router = express.Router();

// // ---- ตัวอย่างข้อมูล (แก้ไขได้ตามชอบ) ----
// const SAMPLE_EVENT_TITLE = 'IT Freshy Camp 2025';
// const applicants = [
//   {
//     id: 101,
//     event_id: 1,
//     title: 'นางสาว',
//     first_name: 'ปทิตตา',
//     last_name: 'ดวงแก้ว',
//     nickname: 'หยบ',
//     email: '66070114@kmitl.ac.th',
//     phone: '0890000000',
//     major: 'IT',
//     cohort: '21',
//     student_code: '66070114',
//     position_applied: 'Logistic Staff',
//     experience: 'เคยช่วยงานฝ่ายสถานที่',
//     motivation: 'อยากเรียนรู้การจัดการอีเวนต์จริง',
//     portfolio_url: 'https://example.com/portfolio',
//     resume_s3_url: 'https://s3.amazonaws.com/bucket/resume.pdf',
//   },
//   {
//     id: 102,
//     event_id: 1,
//     title: 'นาย',
//     first_name: 'กิตติ',
//     last_name: 'ชาญ',
//     nickname: 'กิท',
//     email: 'git@example.com',
//     phone: '0880000000',
//     major: 'DSBA',
//     cohort: '22',
//     student_code: '66071234',
//     position_applied: 'PR Staff',
//     experience: 'เคยทำเพจชมรม',
//     motivation: 'อยากพัฒนาทักษะสื่อสาร',
//     portfolio_url: '',
//     resume_s3_url: '',
//   },
// ];

// // ---- DEV API (ปลอม) ----
// router.get('/dev/api/events/:eventId/staff-applications', (req, res) => {
//   const data = applicants.filter(a => String(a.event_id) === String(req.params.eventId));
//   res.json({ data, meta: { page: 1, limit: data.length, total: data.length, pages: 1 } });
// });

// router.get('/dev/api/events/:eventId/staff-applications/:id', (req, res) => {
//   const item = applicants.find(a => String(a.event_id) === String(req.params.eventId)
//                                  && String(a.id) === String(req.params.id));
//   if (!item) return res.status(404).json({ error: 'not_found' });
//   res.json({ data: item });
// });

// // ---- DEV Pages (ใช้ EJS เดิมของคุณ) ----
// router.get('/dev/admin/events/:eventId/applicants', (req, res) => {
//   const { eventId } = req.params;
//   res.render('admin/applicants', {
//     eventId,
//     eventName: SAMPLE_EVENT_TITLE,
//     apiUrl: `/dev/api/events/${eventId}/staff-applications`,
//   });
// });

// router.get('/dev/admin/events/:eventId/applicants/:applicantId', (req, res) => {
//   const { eventId, applicantId } = req.params;
//   res.render('admin/applicant-detail', {
//     eventId,
//     applicantId,
//     eventName: SAMPLE_EVENT_TITLE,
//     apiUrl: `/dev/api/events/${eventId}/staff-applications/${applicantId}`,
//   });
// });

// module.exports = router;
