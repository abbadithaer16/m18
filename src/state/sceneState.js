// Mutable, non-React state shared between GSAP ScrollTrigger tweens and the
// R3F render loop. Deliberately kept outside React state so a scrub-linked
// scroll animation never triggers a component re-render — only the
// useFrame loop reads these values, every frame, and applies them to the
// actual Three.js objects with damping for a cinematic, lag-smoothed feel.

// Starting, pre-scroll "atmospheric" framing — wide, dim, the car mostly
// in shadow. Each section's useScrollScene call tweens these fields
// toward that section's own end-state, and the next section picks up
// from wherever the previous one left off (a continuous relay).
// camera is polar: angle around (lx,lz), radius (distance), height (world
// y) — see three/cameraRig.js. Every scroll transition is therefore an arc
// around the vehicle rather than a straight-line lerp through space.
export const sceneState = {
  camera: { angle: 0.119, radius: 9.266, height: 1.6, lx: 0, ly: 0.62, lz: 0, fov: 22 },
  vehicle: { rotY: 0.32, posY: 0, posX: 0 },
  light: { key: 0.55, rim: 0.7, fill: 0.16, env: 0.4, floor: 0.16, exposure: 0.6 },
  headlight: { intensity: 0.08 },
  taillight: { intensity: 0.22 },
  wheelSpin: { angle: 0 },
}

/**
 * Directed, one-shot sweep progress values (0→1): a reflection strip
 * travels across the car as each named scene's headline exits, distinct
 * from the ambient pointer-driven reflection response so the two don't
 * fight each other. `hero` sweeps the hood/shoulder as the hero exits;
 * `body` sweeps again, lower and wider, as the body scene exits.
 */
export const sweepState = { hero: 0, body: 0 }

/** Drag-to-rotate offset, added on top of the scroll-driven vehicle.rotY. */
export const dragState = {
  active: false,
  rotY: 0,
  velocity: 0,
}

// Beyond DRAG_COMFORT_LIMIT, the swept-profile body starts reading nearly
// front/rear-on — foreshortened into an unflattering silhouette rather than
// a car. Active drag input (not the momentum coast, which is already kept
// short) gets progressively more resistant from there — a heavy dial, not
// a hard stop: a sustained drag can still push all the way around, it just
// takes real, deliberate effort.
export const DRAG_COMFORT_LIMIT = 0.5
export const DRAG_RESISTANCE_K = 16

/** Normalized (-1..1) pointer position for ambient parallax. */
export const pointerState = { x: 0, y: 0 }

/** Current live configurator selection mirrored for the 3D layer. */
export const configState = {
  bodyColorIndex: 0,
  wheelIndex: 0,
  interiorIndex: 0,
}


