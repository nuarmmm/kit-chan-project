
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
        const willOpen = dd.style.display === 'none' || !dd.style.display;
        dd.style.display = willOpen ? 'block' : 'none';
        dd.classList.toggle('open', willOpen);
        bell.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    }
    bell.addEventListener('click', toggleDD);
    // Close when clicking outside dropdown and outside bell (including bell's children)
    document.addEventListener('click', (e) => {
        if (!dd.contains(e.target) && !bell.contains(e.target)) {
            dd.style.display = 'none';
            dd.classList.remove('open');
            bell.setAttribute('aria-expanded', 'false');
        }
    });

    function render(list) {
        listEl.innerHTML = '';
        if (!list.length) { emptyEl.style.display = 'block'; return; }
        emptyEl.style.display = 'none';
        for (const n of list) {
            const li = document.createElement('li');
            li.className = 'notif-item' + (n.is_read ? '' : ' unread');

            // optional dot/icon column
            const dot = document.createElement('div');
            dot.className = 'notif-dot';
            li.appendChild(dot);

            const content = document.createElement('div');
            content.className = 'notif-content';

            const a = document.createElement('a');
            a.href = n.link || '#';
            a.textContent = n.title || '(ไม่มีชื่อเรื่อง)';
            a.className = 'notif-title' + (n.is_read ? '' : ' unread');

            const p = document.createElement('div');
            p.textContent = n.body || '';
            p.className = 'notif-body';

            a.addEventListener('click', async () => {
                try { await fetch(withToken(`/notifications/${n.id}/read`), { method: 'PATCH', credentials: 'include' }); }
                catch { }
            });

            content.appendChild(a);
            if (n.body) content.appendChild(p);
            li.appendChild(content);

            // action column
            const actions = document.createElement('div');
            actions.className = 'notif-actions';
            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'btn notif-del';
            del.textContent = 'ลบ';
            del.addEventListener('click', async (ev) => {
                ev.preventDefault();
                await fetch(withToken(`/notifications/${n.id}`), { method: 'DELETE', credentials: 'include' });
                await refreshBadge(); await loadList();
            });
            actions.appendChild(del);
            li.appendChild(actions);

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
        clearAllBtn.type = 'button';
        clearAllBtn.className = 'btn notif-clearall';
        clearAllBtn.textContent = 'ลบทั้งหมด';
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
