export function animateCounter(setter: (v: string) => void, target: number, duration = 1400) {
  const startTime = performance.now()
  function tick(now: number) {
    const p = Math.min((now - startTime) / duration, 1)
    const ease = 1 - Math.pow(1 - p, 3)
    setter(Math.round(target * ease).toLocaleString())
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
