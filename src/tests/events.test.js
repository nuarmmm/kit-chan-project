const request = require('supertest');
const app = require('../app');         // <-- แก้
const { __mocks } = require('./test-setup');

describe('Events APIs', () => {
  test('GET /api/events -> list + pagination', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('pages');
  });

  test('GET /api/events/1 -> เจอ', async () => {
    const res = await request(app).get('/api/events/1');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, title: 'ITCamp21' });
  });

  test('GET /api/events/999 -> ไม่เจอ (404)', async () => {
    const res = await request(app).get('/api/events/999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
  });
});
