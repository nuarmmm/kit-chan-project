// Public/js/search.js (robust version)
const API_BASE = '/api/events';

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

async function load(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}?${qs}`);
  const data = await res.json();
  const items = normalizeItems(data);
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
    const thumb = (it.images && it.images[0]) || it.image_url || 'https://placehold.co/600x400';
    return `
      <div class="card" onclick="location.href='/events/${id}'">
        <img src="${thumb}" alt="">
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
