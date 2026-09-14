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
