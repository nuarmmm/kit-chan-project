// tests/test-setup.js
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// ปิด Swagger ตอนเทสต์ (ลด noise)
jest.mock('../swagger', () => ({ setupSwagger: jest.fn() }));

// ---------- Fixtures ----------
const mockEventsRows = [
  { id: 1, title: 'ITCamp21',  category: 'วิชาการ',              created_at: new Date().toISOString() },
  { id: 2, title: 'UniteCamp7', category: 'กีฬาและนันทนาการ',     created_at: new Date().toISOString() },
];

const normalize = (sql) => sql.replace(/\s+/g, ' ').trim().toLowerCase();

// ---------- pg.Pool mock ----------
const mockQuery = jest.fn((text, params = []) => {
  const sql = normalize(text);

  // count events
  if (sql.startsWith('select count(*) from events')) {
    return Promise.resolve({ rows: [{ count: String(mockEventsRows.length) }] });
  }
  // list events (group by)
  if (sql.includes('from events e') && sql.includes('group by e.id')) {
    return Promise.resolve({ rows: mockEventsRows.map(e => ({ ...e, image_url: null })) });
  }
  // get event by id
  if (sql.startsWith('select * from events where id')) {
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

const mockClient  = { query: (...a) => mockQuery(...a), release: jest.fn() };
const mockConnect = jest.fn().mockResolvedValue(mockClient);

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: (...args) => mockQuery(...args),
    connect: mockConnect,
  })),
}));

// export ไว้ใช้ในบางเทสต์ถ้าต้องการ
module.exports.__mocks = { mockQuery, mockConnect, mockClient, mockEventsRows };
