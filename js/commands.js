
const API_BASE = window.location.origin;

let allCommands = [];

const fallbackCommands = [
  { name: 'help', description: 'View all commands and categories', category: 'information', usage: 'help [command]', aliases: [], permissions: '', example: '' },
  { name: 'ping', description: "Check the bot's latency and response time", category: 'information', usage: 'ping', aliases: [], permissions: '', example: '' },
  { name: 'ban', description: 'Ban a member from the server', category: 'moderation', usage: 'ban (user) [reason]', aliases: [], permissions: 'ban', example: '' },
];

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function renderCommands(cmds) {
  const grid = document.getElementById('commands-grid');
  if (!grid) return;
  if (cmds.length === 0) {
    grid.innerHTML = '<div class="commands-empty">No commands found.</div>';
    return;
  }
  grid.innerHTML = cmds.map((c, i) => `
    <div class="command-card" data-idx="${i}">
      <div class="command-top">
        <span class="command-name">${esc(c.name)}</span>
        <button class="cmd-copy" data-cmd="${esc(c.name)}" title="Copy command" aria-label="Copy command">
          <svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <svg class="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
      </div>
      <p class="command-desc">${esc(c.description)}</p>
    </div>
  `).join('');

  grid.querySelectorAll('.cmd-copy').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const text = btn.dataset.cmd;
      navigator.clipboard.writeText(text).then(() => {
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1500);
      });
    });
  });

  grid.querySelectorAll('.command-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.idx);
      const src = grid.closest('.commands-toolbar') ? allCommands : cmds;
      openModal(cmds[idx] || allCommands[idx]);
    });
  });
}

function openModal(c) {
  let overlay = document.getElementById('cmd-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'cmd-modal-overlay';
    overlay.className = 'cmd-modal-overlay';
    overlay.innerHTML = '<div class="cmd-modal" id="cmd-modal"></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }
  const modal = document.getElementById('cmd-modal');
  const aliases = (c.aliases && c.aliases.length) ? c.aliases.join(', ') : 'none';
  
  let perms = 'none';
  if (c.permissions) {
    if (Array.isArray(c.permissions)) {
      if (c.permissions.length > 0) {
        if (typeof c.permissions[0] === 'object') {
          perms = Object.keys(c.permissions[0]).join(', ');
        } else {
          perms = c.permissions.join(', ');
        }
      }
    } else if (typeof c.permissions === 'string') {
      perms = c.permissions;
    }
  }
  
  const example = c.example || '';
  const usage = c.usage || c.signature || c.name;

  const permsList = perms !== 'none'
    ? perms.split(',').map(p => `<span class="cmd-perm-pill">${esc(p.trim())}</span>`).join('')
    : '<span class="cmd-perm-none">none</span>';

  modal.innerHTML = `
    <div class="cmd-modal-head">
      <span class="cmd-modal-title">${esc(c.category || 'General')}</span>
      <span class="cmd-modal-x" role="button" tabindex="0">&times;</span>
    </div>
    <div class="cmd-modal-body">
      <div class="cmd-hero">
        <span class="cmd-name">${esc(c.name)}</span>
      </div>
      <p class="cmd-desc">${esc(c.description)}</p>
      <div class="cmd-details">
        <div class="cmd-row">
          <span class="cmd-label">Usage</span>
          <span class="cmd-mono">${esc(usage)}</span>
        </div>
        ${aliases !== 'none' ? `<div class="cmd-row">
          <span class="cmd-label">Aliases</span>
          <span class="cmd-mono">${esc(aliases)}</span>
        </div>` : ''}
        <div class="cmd-row">
          <span class="cmd-label">Permissions</span>
          <div class="cmd-perms">${permsList}</div>
        </div>
        ${example ? `<div class="cmd-row">
          <span class="cmd-label">Example</span>
          <span class="cmd-mono">${esc(example)}</span>
        </div>` : ''}
      </div>
    </div>
  `;

  modal.querySelector('.cmd-modal-x').addEventListener('click', closeModal);
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => overlay.classList.add('open'));
}

function closeModal() {
  const overlay = document.getElementById('cmd-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  setTimeout(() => overlay.remove(), 200);
}

function buildFilters(cmds) {
  const el = document.getElementById('commands-filters');
  if (!el) return;
  const cats = [...new Set(cmds.map(c => c.category))].sort();
  el.innerHTML = `
    <button class="filter-btn active" data-cat="all">All</button>
    ${cats.map(c => `<button class="filter-btn" data-cat="${c}">${c[0].toUpperCase() + c.slice(1)}</button>`).join('')}
  `;
  el.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter();
    });
  });
}

function applyFilter() {
  const q = (document.getElementById('commands-search')?.value || '').toLowerCase();
  const cat = document.querySelector('.filter-btn.active')?.dataset.cat || 'all';
  const filtered = allCommands.filter(c => {
    const matchQ = c.name.includes(q) || c.description.toLowerCase().includes(q);
    const matchCat = cat === 'all' || c.category === cat;
    return matchQ && matchCat;
  });
  renderCommands(filtered);
}

async function init() {
  try {
    console.log('Fetching commands from https://elara.evict.bot/commands');
    const res = await fetch('https://elara.evict.bot/commands', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    console.log('Response status:', res.status);
    if (!res.ok) {
      console.error('HTTP error:', res.status);
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Raw data type:', typeof data, 'Is array:', Array.isArray(data));
    console.log('Data keys:', Object.keys(data).slice(0, 5));
    
    const commands = data?.data?.commands || data?.commands || data;
    
    const allCmds = [];
    if (typeof commands === 'object' && !Array.isArray(commands)) {
      Object.entries(commands).forEach(([category, categoryCommands]) => {
        if (Array.isArray(categoryCommands)) {
          categoryCommands.forEach(cmd => {
            allCmds.push({
              ...cmd,
              category: category
            });
          });
        }
      });
    } else if (Array.isArray(commands)) {
      allCmds.push(...commands);
    }
    
    console.log('Total commands loaded:', allCmds.length);
    
    allCommands = allCmds
      .filter(cmd => !cmd.hidden)
      .map((cmd, idx) => ({
        name: cmd.qualified_name || cmd.name || `cmd${idx}`,
        description: cmd.description || cmd.help || '',
        category: cmd.category || 'Uncategorized',
        aliases: cmd.aliases || [],
        signature: cmd.signature || '',
        permissions: cmd.permissions || [],
        example: cmd.example || ''
      }));
    
    console.log('Filtered commands:', allCommands.length);
    
  } catch (e) {
    console.error('Error loading commands:', e);
    allCommands = fallbackCommands;
  }
  
  if (allCommands.length === 0) {
    console.warn('No commands loaded, using fallback');
    allCommands = fallbackCommands;
  }
  
  console.log('Final command count:', allCommands.length);
  renderCommands(allCommands);
  buildFilters(allCommands);
  document.getElementById('commands-search')?.addEventListener('input', applyFilter);
}

document.addEventListener('DOMContentLoaded', init);
