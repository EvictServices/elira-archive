export function animateCounter(setter: (v: string) => void, target: number, duration = 1400, from = 0) {
  const startTime = performance.now()
  const range = target - from
  function tick(now: number) {
    const p = Math.min((now - startTime) / duration, 1)
    const ease = 1 - Math.pow(1 - p, 3)
    setter(Math.round(from + range * ease).toLocaleString())
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
