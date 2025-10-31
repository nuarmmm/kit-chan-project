// src/middlewares/upload.js
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: process.env.AWS_REGION });

const storage = multerS3({
  s3,
  bucket: process.env.S3_BUCKET,
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const d = new Date();
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const safe = String(file.originalname || 'file').replace(/\s+/g, '-');
    cb(null, `uploads/events/${y}/${m}/${Date.now()}-${safe}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ✓ ประกาศตัวแปรก่อน
const uploadCoverAndGallery = upload.fields([
  { name: 'cover',  maxCount: 1  },
  { name: 'images', maxCount: 12 }
]);


module.exports = { uploadCoverAndGallery };
