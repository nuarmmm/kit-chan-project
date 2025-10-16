const request = require('supertest');
const app = require('../app');   // <-- แก้

// 1) ไม่ส่ง Authorization -> 401
test('GET /api/users/1 ไม่ส่ง Authorization -> 401', async () => {
  const res = await request(app).get('/api/users/1');
  expect(res.status).toBe(401);
  expect(res.body.message).toMatch(/Unauthorized/i); // ข้อความตาม middleware จริง
});

// 2) ส่ง token (mock ให้ role=admin) -> 200
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(() => ({ id: 99, role: 'admin' })),
}));

test('GET /api/users/1 ด้วย token admin -> 200', async () => {
  const res = await request(app)
    .get('/api/users/1')
    .set('Authorization', 'Bearer faketoken');
  expect(res.status).toBeLessThan(400);
  expect(res.body).toMatchObject({ id: 1 });
});
