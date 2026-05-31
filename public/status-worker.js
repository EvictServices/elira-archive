const POLL = 3000

async function fetchAll() {
  const [health, sys, cmds] = await Promise.allSettled([
    fetch('/api/cluster/health').then((r) => (r.ok ? r.json() : Promise.reject())),
    fetch('/api/cluster/status').then((r) => (r.ok ? r.json() : Promise.reject())),
    fetch('/api/stats/top-commands').then((r) => (r.ok ? r.json() : Promise.reject())),
  ])

  self.postMessage({
    health: health.status === 'fulfilled' ? health.value : null,
    sys: sys.status === 'fulfilled' ? sys.value : null,
    cmds: cmds.status === 'fulfilled' ? cmds.value : null,
    ts: Date.now(),
  })
}

fetchAll()
setInterval(fetchAll, POLL)
