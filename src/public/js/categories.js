document.addEventListener('DOMContentLoaded', () => {
  // Select all category links inside .categories section
  const categoryLinks = document.querySelectorAll('.categories a');

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
            const card = document.createElement('div');
            card.className = 'card';
            card.onclick = () => location.href = `/events/${activity.id || ''}`;
            card.innerHTML = `
              <img src="${activity.image_url}" alt="${activity.name}">
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