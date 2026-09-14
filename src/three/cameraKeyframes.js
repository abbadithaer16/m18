// End-state keyframes for each scroll scene. Each section tweens
// `sceneState` from wherever the previous scene left it to the values
// below, over its own scroll range — a continuous relay rather than
// independent entrance animations. Tuned by eye against screenshots.

export const HERO_END = {
  camera: { x: 2.2, y: 1.22, z: 6.2, lx: 0, ly: 0.56, lz: 0, fov: 27 },
  vehicle: { rotY: 0.55 },
  light: { key: 0.95, rim: 0.85, fill: 0.28, env: 0.55, floor: 0.3, exposure: 0.85 },
  headlight: { intensity: 0.12 },
  taillight: { intensity: 0.3 },
}

export const BODY_END = {
  camera: { x: 5.1, y: 1.1, z: 3.7, lx: 0, ly: 0.58, lz: 0, fov: 32 },
  vehicle: { rotY: 1.0 },
  light: { key: 1.15, rim: 1.0, fill: 0.32, env: 0.65, floor: 0.34, exposure: 1.0 },
  headlight: { intensity: 0.15 },
  taillight: { intensity: 0.32 },
}

export const WHEELS_END = {
  camera: { x: 1.85, y: 0.5, z: 1.55, lx: 1.5, ly: 0.34, lz: 0.78, fov: 20 },
  vehicle: { rotY: 1.0 },
  light: { key: 1.05, rim: 0.75, fill: 0.22, env: 0.55, floor: 0.28, exposure: 0.95 },
  headlight: { intensity: 0.15 },
  taillight: { intensity: 0.28 },
}

export const LIGHT_END = {
  camera: { x: 0.15, y: 0.68, z: 2.85, lx: 0, ly: 0.48, lz: 0, fov: 26 },
  vehicle: { rotY: 0.06 },
  light: { key: 0.3, rim: 0.45, fill: 0.08, env: 0.2, floor: 0.14, exposure: 0.55 },
  headlight: { intensity: 2.4 },
  taillight: { intensity: 0.15 },
}

export const INTERIOR_END = {
  camera: { x: 0.32, y: 1.02, z: 0.85, lx: 0, ly: 0.85, lz: -0.25, fov: 42 },
  vehicle: { rotY: 0.06 },
  light: { key: 0.6, rim: 0.45, fill: 0.2, env: 0.35, floor: 0.1, exposure: 0.75 },
  headlight: { intensity: 0.3 },
  taillight: { intensity: 0.15 },
}

export const STATS_END = {
  camera: { x: 2.6, y: 1.1, z: 5.6, lx: 0, ly: 0.55, lz: 0, fov: 29 },
  vehicle: { rotY: 0.5 },
  light: { key: 0.5, rim: 0.45, fill: 0.15, env: 0.3, floor: 0.18, exposure: 0.65 },
  headlight: { intensity: 0.15 },
  taillight: { intensity: 0.25 },
}

export const CONFIGURATOR_END = {
  camera: { x: 3.6, y: 1.05, z: 4.5, lx: 0, ly: 0.55, lz: 0, fov: 29 },
  vehicle: { rotY: 0.85 },
  light: { key: 1.25, rim: 1.05, fill: 0.35, env: 0.7, floor: 0.36, exposure: 1.05 },
  headlight: { intensity: 0.18 },
  taillight: { intensity: 0.3 },
}

export const FINAL_END = {
  camera: { x: 0, y: 1.3, z: 8.8, lx: 0, ly: 0.55, lz: 0, fov: 23 },
  vehicle: { rotY: 0.4 },
  light: { key: 1.0, rim: 0.9, fill: 0.25, env: 0.55, floor: 0.3, exposure: 0.95 },
  headlight: { intensity: 0.15 },
  taillight: { intensity: 0.3 },
}
