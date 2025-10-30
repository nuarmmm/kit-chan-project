# Kit-Chan (กิจจัง) — Faculty Activities Hub
แพลตฟอร์มรวมข่าว/กิจกรรมของคณะไว้ที่เดียว ให้ค้นหา-สมัคร-ติดตาม ได้ครบทั้งฝั่งผู้ใช้และแอดมิน โดยเน้นสถาปัตยกรรม MVC, API ชัดเจน, มี Auth/Authorize, Unit Test, และดีพลอยบน AWS Elastic Beanstalk พร้อมเก็บรูปบน S3 (ทำเพื่อรายวิชา Cloud/Backend) 

🚪 link: http://kitchan-v1-env.eba-utyd5sr7.ap-southeast-1.elasticbeanstalk.com/

## ✨ Features
### User
ลงทะเบียน/ล็อกอิน (JWT)
ค้นหา/กรอง/แบ่งหน้า (search, filter, pagination)
ดูรายละเอียดกิจกรรมและสมัครเป็นสตาฟของกิจกรรม
โปรไฟล์แก้ไขข้อมูลพื้นฐาน
### Admin
จัดการกิจกรรม (สร้าง/แก้ไข/ลบ, อัปโหลดรูปไป S3)
ดูรายการใบสมัครสตาฟตามกิจกรรม, เปลี่ยนสถานะ (pending/approved/rejected)
จัดหมวดหมู่กิจกรรม, ดูสถิติเล็กน้อย
### Docs & Test
Swagger UI ที่ /api-docs
Unit test ≥ 7 API ด้วย Jest + Supertest (รันใน CI ทุก push) 

## 🧱 Tech Stack
Backend: Node.js + Express.js (MVC)
DB: PostgreSQL (AWS RDS)
Auth: JWT + bcrypt
Storage: AWS S3 (ภาพกิจกรรม), ออปชัน CDN: CloudFront
Frontend: EJS + HTML/CSS/JS (เชื่อมต่อ API)
Docs: Swagger (OpenAPI)
Test: Jest, Supertest
CI: GitHub Actions
Deploy: AWS Elastic Beanstalk (Node.js Platform)




## 👥 Contributors
### นางสาว ปทิตตา ดวงแก้ว 66070114
### นาย ธนานุภัทร รอดปาน 66070269
### นางสาว นจันนัทธ์ พันธุ์กิติยะ 66070279  


## 📜 License
สำหรับการศึกษา/สหกิจ/วิชาการ หากต้องการใช้งานเชิงพาณิชย์ โปรดติดต่อผู้พัฒนา


