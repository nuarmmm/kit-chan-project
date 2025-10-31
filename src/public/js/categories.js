document.addEventListener('DOMContentLoaded', () => {
  // Select all category links inside .categories section
  const categoryLinks = document.querySelectorAll('.categories a');

  // เพิ่ม fallback รูปภาพ (สัญลักษณ์ ?)
  const QUESTION_FALLBACK = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='120' fill='%239ca3af'%3E%3F%3C/text%3E%3C/svg%3E";

  function currentUser() {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  }

  categoryLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const category = link.textContent.trim();
      try {
        let activities = [];
        const activitiesGrid = document.getElementById('activities-grid');
        const activitiesTitle = document.getElementById('activities-title');

        if (category === 'กิจกรรมทั้งหมด') {
          // ดึงทุกหมวด
          const response = await fetch('/api/categories/all');
          activities = await response.json();
          activitiesTitle.textContent = 'กิจกรรมทั้งหมด';

          // ⬅️ แทรกการ์ด “เพิ่มกิจกรรม” เมื่อเป็น admin
          const user = currentUser();
          if (user?.role === 'admin') {
            activities.unshift({ id: -1, name: 'เพิ่มกิจกรรม', image_url: QUESTION_FALLBACK });
          }
        } else {
          const response = await fetch(`/api/categories/${category}`);
          activities = await response.json();
          activitiesTitle.textContent = `กิจกรรมหมวด "${category}"`;
        }

        activitiesGrid.innerHTML = '';
        if (activities.length === 0) {
          activitiesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">ไม่พบกิจกรรม</p>';
        } else {
          activities.forEach(activity => {
            const isAdd = activity.id === -1;
            const card = document.createElement('div');
            card.className = isAdd ? 'card add-card' : 'card';
            card.onclick = () => location.href = isAdd ? '/add-event' : `/events/${activity.id || ''}`;
            card.innerHTML = isAdd
              ? `
                <div class="plus">+</div>
                <p>${activity.name}</p>
              `
              : `
                <img src="${activity.image_url}" alt="${activity.name}" loading="lazy"
                     onerror="this.onerror=null;this.src='${QUESTION_FALLBACK}'">
                <p>${activity.name}</p>
              `;
            activitiesGrid.appendChild(card);
          });
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
      }
    });
  });
});