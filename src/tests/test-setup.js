// tests/test-setup.js
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// ปิด Swagger ตอนเทสต์ (ลด noise และเร็วขึ้น)
jest.mock('../swagger', () => ({ setupSwagger: jest.fn() }));

// ---------- Fixtures ----------
const mockEventsRows = [
  { id: 1, title: 'ITCamp21',  category: 'วิชาการ',          created_at: new Date().toISOString() },
  { id: 2, title: 'UniteCamp7', category: 'กีฬาและนันทนาการ', created_at: new Date().toISOString() },
];

const normalize = (sql) => sql.replace(/\s+/g, ' ').trim().toLowerCase();

// ---------- query mock ----------
const mockQuery = jest.fn((text, params = []) => {
  const sql = normalize(text);

  // count events
  if (sql.startsWith('select count(*) from events')) {
    return Promise.resolve({ rows: [{ count: String(mockEventsRows.length) }] });
  }
  // list events (มี group by e.id)
  if (sql.includes('from events e') && sql.includes('group by e.id')) {
    return Promise.resolve({ rows: mockEventsRows.map(e => ({ ...e, image_url: null })) });
  }
  // get event by id (บางโปรเจกต์ใช้ SELECT * / บางโปรเจกต์ใช้ LEFT JOIN)
  if (sql.includes('from events') && sql.includes('where') && sql.includes('id')) {
    const id = Number(params[0]);
    const row = mockEventsRows.find(r => r.id === id);
    return Promise.resolve({ rows: row ? [row] : [] });
  }
  // get user by id (พอสำหรับ /api/users/:id)
  if (sql.startsWith('select * from users where id')) {
    const id = Number(params[0]);
    return Promise.resolve({ rows: id === 1 ? [{ id: 1, email: 'admin@example.com' }] : [] });
  }

  return Promise.resolve({ rows: [] });
});

// ---------- mock db module โดยตรง (เงียบ pool.connect log) ----------
const mockClient  = { query: (...a) => mockQuery(...a), release: jest.fn() };
const mockConnect = jest.fn().mockResolvedValue(mockClient);

jest.mock('../db', () => ({
  query: (...args) => mockQuery(...args),
  connect: mockConnect,
}));

// (ถ้าอนาคตอยากตรวจว่ามีใครสร้าง Pool จาก 'pg' ตรง ๆ ค่อย mock 'pg' เพิ่ม)
// export ไว้ใช้ถ้าจำเป็น
module.exports.__mocks = { mockQuery, mockConnect, mockClient, mockEventsRows };
