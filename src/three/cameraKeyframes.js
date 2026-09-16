// End-state keyframes for each scroll scene. Each section tweens
// `sceneState` from wherever the previous scene left it to the values
// below, over its own scroll range — a continuous relay rather than
// independent entrance animations. Tuned by eye against screenshots.
//
// camera is polar (angle/radius/height around lx,lz — see cameraRig.js),
// so consecutive keyframes read as an arc the camera travels along rather
// than a straight-line move between two points.

export const HERO_END = {
  camera: { angle: 0.341, radius: 6.579, height: 1.22, lx: 0, ly: 0.56, lz: 0, fov: 27 },
  vehicle: { rotY: 0.55 },
  light: { key: 0.95, rim: 0.85, fill: 0.28, env: 0.55, floor: 0.3, exposure: 0.85 },
  headlight: { intensity: 0.12 },
  taillight: { intensity: 0.3 },
}

export const BODY_END = {
  camera: { angle: 0.941, radius: 6.301, height: 1.1, lx: 0, ly: 0.58, lz: 0, fov: 32 },
  vehicle: { rotY: 1.0, posX: -0.12 },
  light: { key: 1.15, rim: 1.0, fill: 0.32, env: 0.65, floor: 0.34, exposure: 1.0 },
  headlight: { intensity: 0.15 },
  taillight: { intensity: 0.32 },
}

export const WHEELS_END = {
  camera: { angle: 0.427, radius: 0.846, height: 0.5, lx: 1.5, ly: 0.34, lz: 0.78, fov: 20 },
  vehicle: { rotY: 1.0, posX: 0 },
  light: { key: 1.05, rim: 0.75, fill: 0.22, env: 0.55, floor: 0.28, exposure: 0.95 },
  headlight: { intensity: 0.15 },
  taillight: { intensity: 0.28 },
  wheelSpin: { angle: 0.55 },
}

export const LIGHT_END = {
  camera: { angle: 0.053, radius: 2.854, height: 0.68, lx: 0, ly: 0.48, lz: 0, fov: 26 },
  vehicle: { rotY: 0.06 },
  light: { key: 0.3, rim: 0.45, fill: 0.08, env: 0.2, floor: 0.14, exposure: 0.55 },
  headlight: { intensity: 2.4 },
  taillight: { intensity: 0.15 },
}

// The rear 3/4 cinematic beat: camera swings to the opposite (negative
// angle) side from BODY_END's front 3/4, so the two read as mirrored
// compositions — the taillight strip's equivalent of the body scene's
// headlight-side reveal.
export const REAR_END = {
  camera: { angle: -0.95, radius: 6.0, height: 1.05, lx: 0, ly: 0.55, lz: 0, fov: 30 },
  vehicle: { rotY: -0.25 },
  light: { key: 0.5, rim: 1.1, fill: 0.12, env: 0.4, floor: 0.22, exposure: 0.7 },
  headlight: { intensity: 0.35 },
  taillight: { intensity: 1.7 },
}

export const INTERIOR_END = {
  camera: { angle: 0.283, radius: 1.146, height: 1.02, lx: 0, ly: 0.85, lz: -0.25, fov: 42 },
  vehicle: { rotY: 0.06 },
  light: { key: 0.6, rim: 0.45, fill: 0.2, env: 0.35, floor: 0.1, exposure: 0.75 },
  headlight: { intensity: 0.3 },
  taillight: { intensity: 0.15 },
}

export const STATS_END = {
  camera: { angle: 0.434, radius: 6.174, height: 1.1, lx: 0, ly: 0.55, lz: 0, fov: 29 },
  vehicle: { rotY: 0.5 },
  light: { key: 0.5, rim: 0.45, fill: 0.15, env: 0.3, floor: 0.18, exposure: 0.65 },
  headlight: { intensity: 0.15 },
  taillight: { intensity: 0.25 },
}

export const CONFIGURATOR_END = {
  camera: { angle: 0.675, radius: 5.763, height: 1.05, lx: 0, ly: 0.55, lz: 0, fov: 29 },
  vehicle: { rotY: 0.85 },
  light: { key: 1.25, rim: 1.05, fill: 0.35, env: 0.7, floor: 0.36, exposure: 1.05 },
  headlight: { intensity: 0.18 },
  taillight: { intensity: 0.3 },
}

export const FINAL_END = {
  camera: { angle: 0, radius: 8.8, height: 1.3, lx: 0, ly: 0.55, lz: 0, fov: 23 },
  vehicle: { rotY: 0.4 },
  light: { key: 1.0, rim: 0.9, fill: 0.25, env: 0.55, floor: 0.3, exposure: 0.95 },
  headlight: { intensity: 0.15 },
  taillight: { intensity: 0.3 },
}
