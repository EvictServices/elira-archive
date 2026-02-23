
(function () {
  'use strict';

  let updates = [];

  const TAG_HEADINGS = {
    new: 'New Features',
    improved: 'Improvements',
    fixed: 'Bug Fixes',
    removed: 'Removed',
    changed: 'Changes'
  };

  function parseYAML(text) {
    const entries = [];
    let cur = null;
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const trimmed = raw.trimEnd();
      if (trimmed === '' || trimmed.startsWith('#')) continue;
      const indent = raw.length - raw.trimStart().length;
      const line = trimmed.trim();
      if (indent === 0 && line.startsWith('- ')) {
        cur = { changes: [] };
        entries.push(cur);
        const kv = line.slice(2);
        const [k, ...rest] = kv.split(':');
        if (k && rest.length) cur[k.trim()] = rest.join(':').trim();
        continue;
      }
      if (!cur) continue;
      if (indent === 2 && !line.startsWith('- ')) {
        const [k, ...rest] = line.split(':');
        const key = k.trim();
        const val = rest.join(':').trim();
        if (key === 'changes') continue;
        cur[key] = val;
        continue;
      }
      if (indent === 4 && line.startsWith('- ')) {
        const kv = line.slice(2);
        const [tag, ...rest] = kv.split(':');
        if (tag && rest.length) {
          cur.changes.push({ tag: tag.trim(), text: rest.join(':').trim() });
        }
        continue;
      }
    }
    for (const entry of entries) {
      const grouped = {};
      for (const c of entry.changes) {
        if (!grouped[c.tag]) grouped[c.tag] = [];
        grouped[c.tag].push(c);
      }
      const order = ['new', 'improved', 'changed', 'fixed', 'removed'];
      entry.sections = [];
      for (const tag of order) {
        if (grouped[tag]) {
          entry.sections.push({ heading: TAG_HEADINGS[tag] || tag, items: grouped[tag] });
          delete grouped[tag];
        }
      }
      for (const [tag, items] of Object.entries(grouped)) {
        entry.sections.push({ heading: TAG_HEADINGS[tag] || tag, items });
      }
    }
    return entries;
  }

  function timeAgo(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    if (isNaN(date)) return '';
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 0) return 'today';
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return months === 1 ? '1 month ago' : `${months} months ago`;
    const years = Math.floor(months / 12);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }

  function renderTimeline() {
    const timeline = document.getElementById('updates-timeline');
    if (!timeline) return;

    timeline.innerHTML = updates.map((u, i) => `
      <div class="timeline-entry${i === 0 ? ' active' : ''}" data-index="${i}">
      <div class="timeline-info">
          <span class="timeline-version">Entry ${updates.length - i}</span>
          <div class="timeline-title">${u.title || ''}</div>
          <div class="timeline-meta">
            <span>${u.date || ''}</span>
            <span class="timeline-meta-sep">&middot;</span>
            <span>${timeAgo(u.date)}</span>
          </div>
        </div>
      </div>
    `).join('');

    timeline.querySelectorAll('.timeline-entry').forEach(entry => {
      entry.addEventListener('click', () => {
        timeline.querySelectorAll('.timeline-entry').forEach(e => e.classList.remove('active'));
        entry.classList.add('active');
        showDetail(parseInt(entry.dataset.index, 10));
      });
    });
  }

  function showDetail(index) {
    const panel = document.getElementById('update-detail');
    if (!panel) return;
    const u = updates[index];
    if (!u) return;

    panel.innerHTML = `
      <div class="update-detail-header">
        <span class="update-detail-version">Entry ${updates.length - index}</span>
        <h2 class="update-detail-title">${u.title || ''}</h2>
        <p class="update-detail-date">${u.date || ''}${timeAgo(u.date) ? ' — ' + timeAgo(u.date) : ''}</p>
      </div>
      <div class="update-detail-body">
        ${u.description ? `<p style="color:var(--text-secondary);margin-bottom:1.25rem;font-size:0.9rem;line-height:1.65">${u.description}</p>` : ''}
        ${(u.sections || []).map(s => `
          <h4>${s.heading}</h4>
          <ul>
            ${s.items.map(item => `
              <li><span class="update-tag ${item.tag}">${item.tag}</span> ${item.text}</li>
            `).join('')}
          </ul>
        `).join('')}
      </div>
    `;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const res = await fetch('/data/updates.yaml');
      if (res.ok) {
        const text = await res.text();
        updates = parseYAML(text);
        updates.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
    } catch (e) {}

    const timeline = document.getElementById('updates-timeline');
    const detail = document.getElementById('update-detail');
    if (updates.length === 0) {
      if (timeline) timeline.innerHTML = '<div style="padding:2rem;color:var(--text-muted);font-size:0.9rem;text-align:center">No updates yet.</div>';
      if (detail) detail.innerHTML = '<div class="update-detail-empty">No updates to display</div>';
      return;
    }
    renderTimeline();
    showDetail(0);
  });
})();
