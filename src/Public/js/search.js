// Public/js/search.js (robust version)
const API_BASE = '/api/events';
// Data-URI SVG (question mark) as a safe, inline fallback image
const QUESTION_FALLBACK = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='120' fill='%239ca3af'%3E%3F%3C/text%3E%3C/svg%3E";

// เผื่อไม่ได้ใส่ id ก็จับจาก .search-bar input ได้
const grid  = document.getElementById('activities-grid');
const input = document.getElementById('searchInput') || document.querySelector('.search-bar input');

function normalizeItems(data) {
  // รองรับ: array ตรงๆ, {items: [...]}, {data: [...]}
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.data))  return data.data;
  return [];
}

function currentUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); }
  catch { return null; }
}

async function load(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/events?${qs}`);
  const data = await res.json();
  const items = Array.isArray(data) ? data : (data.items || data.data || []);

  const user = currentUser();
  console.log('Current user:', user);
  if (user?.role === 'admin') {
    items.unshift({ id: -1, title: 'เพิ่มกิจกรรม', image_url: 'https://placehold.co/600x400' });
  }

  renderCards(items);
}


function renderCards(items) {
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = `<div style="padding:24px;color:#666">ไม่พบกิจกรรมที่ตรงกับคำค้น</div>`;
    return;
  }
  grid.innerHTML = items.map(it => {
    const id    = it.id ?? it.event_id ?? '';
    const title = it.title ?? it.name ?? '(ไม่มีชื่อกิจกรรม)';
    const thumb = (it.images && it.images[0]) || it.image_url || it.cover_url || QUESTION_FALLBACK;
    if (id === -1) {
      return `
      <div class="card add-card" onclick="location.href='/add-event'">
        <div class="plus">+</div>
        <p>${title}</p>
      </div>
      `;
    }
    return `
      <div class="card" onclick="location.href='/events/${id}'">
        <img src="${thumb}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${QUESTION_FALLBACK}';">
        <p>${title}</p>
      </div>
    `;
  }).join('');
}

// กด Enter เพื่อค้นหา
if (input) {
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const q = input.value.trim();
    if (/^\d{4}$/.test(q)) {
      // พิมพ์เป็นปี → แปลงเป็นช่วงทั้งปี
      load({ from: `${q}-01-01`, to: `${q}-12-31`, sort: '-start_at', limit: 12 });
    } else if (q) {
      load({ search: q, sort: '-start_at', limit: 12 });
    } else {
      load({ sort: '-start_at', limit: 12 });
    }
  });
}

// โหลดครั้งแรก
load({ sort: '-start_at', limit: 12 });
