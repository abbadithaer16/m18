// Mutable, non-React state shared between GSAP ScrollTrigger tweens and the
// R3F render loop. Deliberately kept outside React state so a scrub-linked
// scroll animation never triggers a component re-render — only the
// useFrame loop reads these values, every frame, and applies them to the
// actual Three.js objects with damping for a cinematic, lag-smoothed feel.

// Starting, pre-scroll "atmospheric" framing — wide, dim, the car mostly
// in shadow. Each section's useScrollScene call tweens these fields
// toward that section's own end-state, and the next section picks up
// from wherever the previous one left off (a continuous relay).
export const sceneState = {
  // portraitFit: 0–1 weight of the portrait-viewport pull-back (see Experience).
  camera: { x: 1.1, y: 1.6, z: 9.2, lx: 0, ly: 0.62, lz: 0, fov: 22, portraitFit: 1 },
  vehicle: { rotY: 0.32, posY: 0, posX: 0 },
  light: { key: 0.55, rim: 0.7, fill: 0.16, env: 0.4, floor: 0.16, exposure: 0.6 },
  headlight: { intensity: 0.08 },
  taillight: { intensity: 0.22 },
}

/** Drag-to-rotate offset, added on top of the scroll-driven vehicle.rotY. */
export const dragState = {
  active: false,
  rotY: 0,
  velocity: 0,
}

/** Normalized (-1..1) pointer position for ambient parallax. */
export const pointerState = { x: 0, y: 0 }

/** Current live configurator selection mirrored for the 3D layer. */
export const configState = {
  bodyColorIndex: 0,
  wheelIndex: 0,
  interiorIndex: 0,
}
