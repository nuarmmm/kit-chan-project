(function () {
    const bell = document.getElementById('notif-bell');
    const badge = document.getElementById('notif-badge');
    const dd = document.getElementById('notif-dropdown');
    const listEl = document.getElementById('notif-list');
    const emptyEl = document.getElementById('notif-empty');
    const markAllBtn = document.getElementById('notif-markall');
    if (!bell || !dd) return;

    function withToken(url) {
        const t = localStorage.getItem('token');
        if (!t) return url;
        const sep = url.includes('?') ? '&' : '?';
        return `${url}${sep}token=${encodeURIComponent(t)}`;
    }

    function toggleDD() {
        dd.style.display = dd.style.display === 'none' || !dd.style.display ? 'block' : 'none';
    }
    bell.addEventListener('click', toggleDD);
    document.addEventListener('click', (e) => { if (!dd.contains(e.target) && e.target !== bell) dd.style.display = 'none'; });

    function render(list) {
        listEl.innerHTML = '';
        if (!list.length) { emptyEl.style.display = 'block'; return; }
        emptyEl.style.display = 'none';
        for (const n of list) {
            const li = document.createElement('li');
            li.style.padding = '10px 12px';
            li.style.borderBottom = '1px solid #f3f4f6';
            li.style.background = n.is_read ? '#fff' : '#f9fafb';

            const a = document.createElement('a');
            a.href = n.link || '#';
            a.textContent = n.title || '(ไม่มีชื่อเรื่อง)';
            a.style.display = 'block';
            a.style.fontWeight = n.is_read ? 'normal' : '600';
            a.style.marginBottom = '4px';

            const p = document.createElement('div');
            p.textContent = n.body || '';
            p.style.fontSize = '12px';
            p.style.color = '#6b7280';

            a.addEventListener('click', async () => {
                try { await fetch(withToken(`/notifications/${n.id}/read`), { method: 'PATCH', credentials: 'include' }); }
                catch { }
            });

            li.appendChild(a);
            if (n.body) li.appendChild(p);
            // ปุ่มลบรายแถว
            const del = document.createElement('button');
            del.textContent = 'ลบ';
            del.style.fontSize = '12px';
            del.style.marginTop = '6px';
            del.addEventListener('click', async (ev) => {
                ev.preventDefault();
                await fetch(withToken(`/notifications/${n.id}`), { method: 'DELETE', credentials: 'include' });
                await refreshBadge(); await loadList();
            });
            li.appendChild(del);

            listEl.appendChild(li);
        }
    }

    async function loadList() {
        const res = await fetch(withToken('/notifications?limit=10'), { credentials: 'include' });
        const list = await res.json();
        render(list);
    }

    async function refreshBadge() {
        const res = await fetch(withToken('/notifications/unread-count'), { credentials: 'include' });
        const { count } = await res.json();
        if (count > 0) { badge.style.display = 'inline-block'; badge.textContent = count; }
        else { badge.style.display = 'none'; badge.textContent = ''; }
    }

    markAllBtn?.addEventListener('click', async () => {
        await fetch(withToken('/notifications/mark-all-read'), { method: 'POST', credentials: 'include' });
        await refreshBadge(); await loadList();
    });

    // ปุ่มลบทั้งหมด
    let clearAllBtn = document.getElementById('notif-clearall');
    if (!clearAllBtn) {
        clearAllBtn = document.createElement('button');
        clearAllBtn.id = 'notif-clearall';
        clearAllBtn.textContent = 'ลบทั้งหมด';
        clearAllBtn.style.marginLeft = '8px';
        markAllBtn?.parentNode?.appendChild(clearAllBtn);
    }
    clearAllBtn.addEventListener('click', async () => {
        await fetch(withToken('/notifications'), { method: 'DELETE', credentials: 'include' });
        await refreshBadge(); await loadList();
    });


    // เริ่มต้น
    refreshBadge(); loadList();

    // SSE
    const t = localStorage.getItem('token');
    const es = new EventSource(t ? `/notifications/stream?token=${encodeURIComponent(t)}` : '/notifications/stream');
    es.addEventListener('notification', async () => { await refreshBadge(); await loadList(); });
})();
