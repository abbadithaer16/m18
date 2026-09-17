// Shared color + material constants for the 3D scene.
// Keeping these out of components lets the whole render stay tonally
// consistent and makes future GLB / material swaps a one-line change.

export const PALETTE = {
  void: '#020202',
  charcoal: '#0a0a0b',
  graphite: '#161617',
  steel: '#38393b',
  silver: '#c9cacc',
  warmWhite: '#f4f1ea',
  accentRed: '#b3121c',
  glassTint: '#07080a',
}

export const GLOSS_BLACK = {
  color: '#050505',
  metalness: 0.55,
  roughness: 0.22,
}

export const BRUSHED_ALUMINUM = {
  color: '#c7c8ca',
  metalness: 1,
  roughness: 0.38,
}

export const RUBBER = {
  color: '#0d0d0d',
  roughness: 0.95,
  metalness: 0,
}

export const CALIPER_RED = {
  color: '#8f0f16',
  metalness: 0.6,
  roughness: 0.35,
}

export const DISC_METAL = {
  color: '#9a9a9c',
  metalness: 0.9,
  roughness: 0.45,
}

export const GLASS = {
  color: '#0b0d10',
  metalness: 0.1,
  roughness: 0.05,
  transparent: true,
  opacity: 0.55,
  depthWrite: false,
}

// Dark aero surfaces (splitter, diffuser, wing, canards) — distinct from
// GLOSS_BLACK trim: a touch of clearcoat sheen over a low-metalness base,
// reading as a resin-finished composite panel rather than painted plastic.
export const CARBON_FIBER = {
  color: '#0c0c0e',
  metalness: 0.2,
  roughness: 0.38,
  clearcoat: 0.55,
  clearcoatRoughness: 0.28,
}
