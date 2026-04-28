const POLL = 3000

async function fetchAll() {
  const [health, sys, cmds] = await Promise.allSettled([
    fetch('/api/health').then((r) => (r.ok ? r.json() : Promise.reject())),
    fetch('/api/status').then((r) => (r.ok ? r.json() : Promise.reject())),
    fetch('/api/top-commands').then((r) => (r.ok ? r.json() : Promise.reject())),
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
