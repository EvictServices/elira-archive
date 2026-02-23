
const API_BASE = window.location.origin;

function animateCounter(el, target, duration = 1400) {
  const startTime = performance.now();
  const suffix = el.dataset.suffix || '';
  function tick(now) {
    const p = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * ease).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

async function loadHeroStats() {
  const badge = document.querySelector('.hero-badge');
  const badgeDot = badge?.querySelector('.dot');
  const badgeText = badge?.childNodes[badge.childNodes.length - 1];

  try {
    const res = await fetch('https://elara.evict.bot/health');
    if (!res.ok) return;
    const d = await res.json();

    const isOnline = d.users != null;

    if (badge && badgeDot) {
      if (isOnline) {
        badgeDot.style.background = 'var(--online)';
        if (badgeText && badgeText.nodeType === 3) badgeText.textContent = ' Online now';
      } else {
        badgeDot.style.background = 'var(--danger)';
        badgeDot.style.animation = 'none';
        if (badgeText && badgeText.nodeType === 3) badgeText.textContent = ' Offline';
      }
    }

    const hs = document.getElementById('hero-servers');
    const hu = document.getElementById('hero-users');
    const hc = document.getElementById('hero-commands');

    if (isOnline) {
      if (hs && d.guilds != null) animateCounter(hs, d.guilds);
      if (hu && d.users != null) animateCounter(hu, d.users);
      if (hc) {
        try {
          const cmdRes = await fetch('https://elara.evict.bot/commands');
          if (cmdRes.ok) {
            const cmdData = await cmdRes.json();
            const commands = cmdData?.data?.commands || {};
            let cmdCount = 0;
            Object.values(commands).forEach(cat => {
              if (Array.isArray(cat)) cmdCount += cat.length;
            });
            animateCounter(hc, cmdCount);
          }
        } catch {}
      }
    } else {
      if (hs) hs.textContent = '0';
      if (hu) hu.textContent = '0';
      if (hc) hc.textContent = '0';
    }
  } catch {
    if (badge && badgeDot) {
      badgeDot.style.background = 'var(--danger)';
      badgeDot.style.animation = 'none';
      if (badgeText && badgeText.nodeType === 3) badgeText.textContent = ' Offline';
    }
  }
}

document.addEventListener('DOMContentLoaded', loadHeroStats);
