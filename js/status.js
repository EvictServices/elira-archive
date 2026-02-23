
(function () {
  'use strict';

  const POLL = 5000;
  const POINTS = 40;

  const history = { latency: [], cpu: [], memory: [], network: [] };
  let lastRx = null, lastTx = null;
  let botIsOnline = false;

  function animate(el, to, dur = 900) {
    if (!el) return;
    const t0 = performance.now();
    const from = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10) || 0;
    (function step(now) {
      const t = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * e).toLocaleString();
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }

  function uptimeStr(secs) {
    if (!secs) return '0s';
    if (secs < 60) return secs + 's';
    if (secs < 3600) return Math.floor(secs / 60) + 'm';
    const h = Math.floor(secs / 3600);
    if (h < 24) return h + 'h ' + Math.floor((secs % 3600) / 60) + 'm';
    const d = Math.floor(h / 24);
    return d + 'd ' + (h % 24) + 'h';
  }

  function ts() {
    return new Date().toLocaleString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  function fmtBytes(b) {
    if (b < 1024) return b.toFixed(0) + ' B/s';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB/s';
    return (b / 1048576).toFixed(2) + ' MB/s';
  }

  const CHART_COLORS = {
    accent:  { stroke: '#6b72cc', fill: 'rgba(107,114,204,0.15)' },
    green:   { stroke: '#5b9bd4', fill: 'rgba(91,155,212,0.12)' },
    orange:  { stroke: '#9b7de0', fill: 'rgba(155,125,224,0.12)' },
    purple:  { stroke: '#4a6ee0', fill: 'rgba(74,110,224,0.12)' },
  };

  function renderChart(containerId, data, maxVal, colorKey, fmtFn) {
    const container = document.getElementById(containerId);
    if (!container) return;

    while (data.length < POINTS) data.unshift(0);
    if (data.length > POINTS) data.splice(0, data.length - POINTS);

    const w = 400, h = 100, pad = 1;
    const m = maxVal > 0 ? maxVal : 1;
    const c = CHART_COLORS[colorKey] || CHART_COLORS.accent;

    const pts = data.map((v, i) => {
      const x = pad + (i / (POINTS - 1)) * (w - pad * 2);
      const y = h - pad - ((v / m) * (h - pad * 2));
      return { x, y, v };
    });

    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const areaPath = linePath + ` L${pts[pts.length - 1].x.toFixed(1)},${h} L${pts[0].x.toFixed(1)},${h} Z`;

    container.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" class="chart-svg">
        <defs>
          <linearGradient id="grad-${containerId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${c.stroke}" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="${c.stroke}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="${areaPath}" fill="url(#grad-${containerId})" />
        <path d="${linePath}" fill="none" stroke="${c.stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
        <evict.webp cx="${pts[pts.length - 1].x.toFixed(1)}" cy="${pts[pts.length - 1].y.toFixed(1)}" r="3" fill="${c.stroke}" vector-effect="non-scaling-stroke"/>
        <line class="chart-hover-line" x1="0" y1="0" x2="0" y2="${h}" stroke="${c.stroke}" stroke-opacity="0.35" stroke-width="1" stroke-dasharray="3,2" vector-effect="non-scaling-stroke" style="display:none"/>
        <evict.webp class="chart-hover-dot" cx="0" cy="0" r="4" fill="${c.stroke}" stroke="#0d1017" stroke-width="1.5" vector-effect="non-scaling-stroke" style="display:none"/>
        <rect width="${w}" height="${h}" fill="transparent" class="chart-hit-area"/>
      </svg>
      <div class="chart-tooltip"></div>`;

    const svg = container.querySelector('.chart-svg');
    const tooltip = container.querySelector('.chart-tooltip');
    const hoverLine = container.querySelector('.chart-hover-line');
    const hoverDot = container.querySelector('.chart-hover-dot');
    let active = false;

    function onMove(clientX) {
      const rect = svg.getBoundingClientRect();
      const xRatio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const idx = Math.round(xRatio * (pts.length - 1));
      if (idx < 0 || idx >= pts.length) return;
      const p = pts[idx];

      hoverLine.setAttribute('x1', p.x.toFixed(1));
      hoverLine.setAttribute('x2', p.x.toFixed(1));
      hoverLine.style.display = '';
      hoverDot.setAttribute('cx', p.x.toFixed(1));
      hoverDot.setAttribute('cy', p.y.toFixed(1));
      hoverDot.style.display = '';

      const label = fmtFn ? fmtFn(p.v) : p.v.toFixed(1);
      tooltip.textContent = label;
      if (!active) { tooltip.classList.add('visible'); active = true; }

      const pctX = (p.x / w) * 100;
      const pctY = (p.y / h) * 100;
      tooltip.style.left = pctX + '%';
      tooltip.style.top = Math.max(0, pctY - 28) + '%';
    }

    function onLeave() {
      hoverLine.style.display = 'none';
      hoverDot.style.display = 'none';
      tooltip.classList.remove('visible');
      active = false;
    }

    svg.addEventListener('mousemove', e => onMove(e.clientX));
    svg.addEventListener('mouseleave', onLeave);
    svg.addEventListener('touchmove', e => { e.preventDefault(); onMove(e.touches[0].clientX); }, { passive: false });
    svg.addEventListener('touchend', onLeave);
  }

  function fmtUptime(s) {
    if (!s || s <= 0) return '—';
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600),
          m = Math.floor((s % 3600) / 60);
    if (d > 0) return d + 'd ' + h + 'h';
    if (h > 0) return h + 'h ' + m + 'm';
    return m + 'm';
  }

  function renderClusters(clusters) {
    const grid = document.getElementById('shard-grid');
    if (!grid) return;

    const clusterIds = Object.keys(clusters || {});
    if (clusterIds.length === 0) {
      grid.innerHTML = '<div class="cluster-empty">No clusters</div>';
      return;
    }

    grid.innerHTML = clusterIds.map((cId, idx) => {
      const c = clusters[cId];
      const ok = c.alive === true;
      const statusClass = ok ? 'online' : 'offline';
      const shards = c.shards || [];
      const toggleId = `cluster-toggle-${cId}`;
      const contentId = `cluster-content-${cId}`;
      const avgLat = shards.length ? (shards.reduce((a, s) => a + (s.latency || 0), 0) / shards.length * 1000).toFixed(0) : '—';

      return `
        <div class="cluster-item">
          <div class="cluster-item-header" onclick="document.getElementById('${contentId}').classList.toggle('hidden'); document.getElementById('${toggleId}').classList.toggle('expanded');">
            <div class="cluster-item-left">
              <span class="cluster-toggle" id="${toggleId}">▶</span>
              <span class="cluster-item-id">Cluster ${idx}</span>
              <span class="cluster-status ${statusClass}">${ok ? '●' : '○'}</span>
            </div>
            <div class="cluster-item-stats">
              <div class="cluster-item-stat">
                <span class="cluster-item-stat-value">${(c.guilds || 0).toLocaleString()}</span>
                <span class="cluster-item-stat-label">guilds</span>
              </div>
              <div class="cluster-item-stat">
                <span class="cluster-item-stat-value">${(c.users || 0).toLocaleString()}</span>
                <span class="cluster-item-stat-label">users</span>
              </div>
              <div class="cluster-item-stat">
                <span class="cluster-item-stat-value">${shards.length}</span>
                <span class="cluster-item-stat-label">shards</span>
              </div>
              <div class="cluster-item-stat">
                <span class="cluster-item-stat-value">${avgLat}</span>
                <span class="cluster-item-stat-label">ms</span>
              </div>
            </div>
            <span class="cluster-item-uptime">${fmtUptime(c.uptime)}</span>
          </div>
          <div class="cluster-item-content hidden" id="${contentId}">
            ${shards.map(s => `
              <div class="shard-item">
                <div class="shard-item-left">
                  <span class="shard-item-id">Shard ${s.id}</span>
                </div>
                <div class="shard-item-stats">
                  <div class="shard-item-stat">
                    <span class="shard-item-stat-value">${(s.guilds || 0).toLocaleString()}</span>
                    <span class="shard-item-stat-label">guilds</span>
                  </div>
                  <div class="shard-item-stat">
                    <span class="shard-item-stat-value">${(s.users || 0).toLocaleString()}</span>
                    <span class="shard-item-stat-label">users</span>
                  </div>
                  <div class="shard-item-stat">
                    <span class="shard-item-stat-value">${s.latency && s.latency > 0 ? (s.latency * 1000).toFixed(0) : '—'}</span>
                    <span class="shard-item-stat-label">ms</span>
                  </div>
                </div>
                <span class="shard-item-uptime">${fmtUptime(s.uptime)}</span>
              </div>
            `).join('')}
          </div>
        </div>`;
    }).join('');
  }

  function renderTopCommands(list) {
    const grid = document.getElementById('top-commands-grid');
    if (!grid) return;

    if (!list || !list.length) {
      grid.innerHTML = '<div class="top-cmd-empty">No data yet</div>';
      return;
    }

    grid.innerHTML = list.map((item, idx) => {
      const safeName = String(item.name || '').replace(/[^a-zA-Z0-9_\- ]/g, '').slice(0, 64);
      const uses = Number(item.uses || 0);
      const rankClass = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : '';
      return `
        <div class="top-cmd-item">
          <span class="top-cmd-item-rank ${rankClass}">#${idx + 1}</span>
          <span class="top-cmd-item-name">${safeName}</span>
          <span class="top-cmd-item-uses">${uses.toLocaleString()}</span>
        </div>`;
    }).join('');
  }

  function setOfflineState() {
    const se = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    se('stat-guilds', '0');
    se('stat-users', '0');
    se('stat-shards', '0');

    history.latency.push(0);
    history.cpu.push(0);
    history.memory.push(0);
    history.network.push(0);
    renderChart('chart-latency', [...history.latency], 100, 'accent', v => v.toFixed(0) + 'ms');
    renderChart('chart-cpu', [...history.cpu], 100, 'orange', v => v.toFixed(1) + '%');
    renderChart('chart-memory', [...history.memory], 100, 'purple', v => v.toFixed(0) + ' MB');
    renderChart('chart-network', [...history.network], 1, 'green', v => fmtBytes(v));

    se('chart-latency-val', '0ms');
    se('chart-cpu-val', '0%');
    se('chart-mem-val', '0 MB');
    se('chart-net-val', '0 B/s');
  }

  async function load() {


    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 4000);

    try {
      const r = await fetch('https://elara.evict.bot/health', { signal: ac.signal });
      clearTimeout(to);
      if (!r.ok) throw 0;
      const d = await r.json();

      const isOnline = d.online !== false;
      botIsOnline = isOnline;

      if (!isOnline) {
        setOfflineState();
        return;
      }

      animate(document.getElementById('stat-guilds'), d.guilds || 0);
      animate(document.getElementById('stat-users'), d.users || 0);

      const clusters = d.clusters || {};
      const clusterIds = Object.keys(clusters);
      
      let allShards = [];
      for (const cId of clusterIds) {
        const c = clusters[cId];
        if (c.shards) allShards = allShards.concat(c.shards);
      }
      
      const se = document.getElementById('stat-shards');
      if (se) se.textContent = allShards.length.toString();

      let avgLat = 0;
      const shardLats = allShards.map(s => s.latency).filter(v => v != null && v > 0);
      if (shardLats.length) avgLat = Math.round(shardLats.reduce((a, b) => a + b, 0) / shardLats.length * 1000);

      renderClusters(clusters);

      const cpu = d.system?.cpu_percent ?? 0;
      const memMb = d.system?.memory_used_mb ?? 0;
      const rx = d.system?.network_rx_bytes ?? 0;
      const tx = d.system?.network_tx_bytes ?? 0;
      const isFirstLoad = history.latency.length === 0;

      if (isFirstLoad && d.history && d.history.length > 1) {
        for (const h of d.history) {
          history.latency.push(h.gateway_latency_ms);
          history.cpu.push(h.cpu_percent);
          history.memory.push(h.memory_mb);
        }
        for (let i = 0; i < d.history.length; i++) {
          if (i === 0) { history.network.push(0); continue; }
          const prev = d.history[i - 1];
          const curr = d.history[i];
          const dRx = Math.max(0, curr.network_rx_bytes - prev.network_rx_bytes);
          const dTx = Math.max(0, curr.network_tx_bytes - prev.network_tx_bytes);
          history.network.push((dRx + dTx) / (POLL / 1000));
        }
        const last = d.history[d.history.length - 1];
        lastRx = last.network_rx_bytes;
        lastTx = last.network_tx_bytes;
      } else {
        history.latency.push(avgLat);
        history.cpu.push(cpu);
        history.memory.push(memMb);
        let netRate = 0;
        if (lastRx !== null && lastTx !== null) {
          const deltaRx = Math.max(0, rx - lastRx);
          const deltaTx = Math.max(0, tx - lastTx);
          netRate = (deltaRx + deltaTx) / (POLL / 1000);
        }
        lastRx = rx;
        lastTx = tx;
        history.network.push(netRate);
      }

      const maxLat = Math.max(...history.latency, 50);
      renderChart('chart-latency', [...history.latency], maxLat, 'accent', v => v.toFixed(0) + 'ms');
      const clv = document.getElementById('chart-latency-val');
      if (clv) clv.textContent = avgLat + 'ms';

      renderChart('chart-cpu', [...history.cpu], 100, 'orange', v => v.toFixed(1) + '%');
      const cpuv = document.getElementById('chart-cpu-val');
      if (cpuv) cpuv.textContent = cpu.toFixed(1) + '%';

      const maxMem = Math.max(...history.memory, 64);
      renderChart('chart-memory', [...history.memory], maxMem, 'purple', v => v.toFixed(0) + ' MB');
      const memv = document.getElementById('chart-mem-val');
      if (memv) memv.textContent = memMb + ' MB';

      const maxNet = Math.max(...history.network, 1024);
      renderChart('chart-network', [...history.network], maxNet, 'green', v => fmtBytes(v));
      const netVal = history.network[history.network.length - 1] || 0;
      const nv = document.getElementById('chart-net-val');
      if (nv) nv.textContent = fmtBytes(netVal);

      renderTopCommands(d.top_commands || []);

    } catch {
      setOfflineState();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderChart('chart-latency', [], 100, 'accent', v => v.toFixed(0) + 'ms');
    renderChart('chart-cpu', [], 100, 'orange', v => v.toFixed(1) + '%');
    renderChart('chart-memory', [], 100, 'purple', v => v.toFixed(0) + ' MB');
    renderChart('chart-network', [], 1, 'green', v => fmtBytes(v));
    load();
    setInterval(load, POLL);
  });
})();
