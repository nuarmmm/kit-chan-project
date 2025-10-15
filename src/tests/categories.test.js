const request = require('supertest');
const app = require('../app'); // <-- แก้ตรงนี้

describe('Categories APIs', () => {
  test('GET /api/categories/all -> รวมกิจกรรม', async () => {
    const res = await request(app).get('/api/categories/all');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // dataset จริงมี 4 รายการ ลิสต์สั้น ๆ แบบไม่เป๊ะจำนวนก็ได้กันพังเวลาเพิ่มข้อมูล
    const names = res.body.map(x => x.name);
    expect(names).toEqual(expect.arrayContaining(['ITCamp21', 'TobeIT66', 'UniteCamp7', 'IT3K']));
  });

  test('GET /api/categories/วิชาการ -> เฉพาะหมวด', async () => {
    const res = await request(app).get(encodeURI('/api/categories/วิชาการ'));
    expect(res.status).toBe(200);
    const names = res.body.map(x => x.name);
    expect(names).toEqual(expect.arrayContaining(['ITCamp21', 'TobeIT66']));
  });
});
