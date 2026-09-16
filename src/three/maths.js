// Small math helpers shared by the scene-driving code.

/** Frame-rate independent exponential damping (Three.js MathUtils.damp pattern). */
export function damp(current, target, lambda, dt) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}

/**
 * Rubber-band falloff: 1 within `limit` of zero, decaying exponentially
 * (not easing-in from a standstill — real resistance from the first
 * millimeter past the line) toward `floor` beyond it. Multiplying an
 * incoming delta by this gives the classic "resistance near the edge"
 * feel — mobile overscroll, a rotation dial nearing its comfortable range
 * — without ever fully blocking input: a sustained push still gets
 * through, just at a fraction of the speed.
 */
export function rubberBandFalloff(value, limit, k, floor = 0.06) {
  const overshoot = Math.max(0, Math.abs(value) - limit)
  return floor + (1 - floor) * Math.exp(-k * overshoot)
}

/**
 * One step of a damped spring toward `target`. Used for the vehicle's
 * secondary motion (body roll/pitch/suspension) so it settles with the soft
 * overshoot-free feel of a real damper rather than a linear/exponential
 * glide. Returns the next [value, velocity] pair.
 */
export function springStep(value, velocity, target, stiffness, damping, dt) {
  const accel = (target - value) * stiffness - velocity * damping
  const nextVelocity = velocity + accel * dt
  const nextValue = value + nextVelocity * dt
  return [nextValue, nextVelocity]
}
