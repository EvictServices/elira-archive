/** Ease-out cubic count-up (matches status page). */
export const COUNTER_ANIM_MS = 900

function tickCounter(
  setter: (v: string) => void,
  from: number,
  target: number,
  duration: number,
  startTime: number
) {
  function frame(now: number) {
    const p = Math.min((now - startTime) / duration, 1)
    const ease = 1 - Math.pow(1 - p, 3)
    setter(Math.round(from + (target - from) * ease).toLocaleString())
    if (p < 1) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

export function animateCounter(setter: (v: string) => void, target: number, duration = COUNTER_ANIM_MS) {
  tickCounter(setter, 0, target, duration, performance.now())
}

export function animateCounterFrom(
  setter: (v: string) => void,
  from: number,
  target: number,
  duration = COUNTER_ANIM_MS
) {
  tickCounter(setter, from, target, duration, performance.now())
}
