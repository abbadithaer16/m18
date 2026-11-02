// Central copy + configuration data for the AUREX / ONE experience.
// Keeping copy here (rather than scattered through components) makes the
// site easy to re-brand or localize without touching layout/animation code.

export const NAV_LINKS = [
  { label: 'ONE', href: '#scene-body' },
  { label: 'ENGINEERING', href: '#scene-wheels' },
  { label: 'INTERIOR', href: '#scene-interior' },
  { label: 'CONFIGURE', href: '#configurator' },
]

export const FOOTER_LINKS = [
  { label: 'ONE', href: '#scene-body' },
  { label: 'ENGINEERING', href: '#scene-wheels' },
  { label: 'CONFIGURE', href: '#configurator' },
  { label: 'CONTACT', href: '#final' },
]

export const HERO = {
  eyebrow: 'AUREX / ONE',
  headlineLines: ['BUILT', 'TO BE', 'FELT.'],
  body: 'Performance is measured in numbers. Emotion is measured differently.',
  ctaPrimary: 'EXPLORE ONE',
  ctaSecondary: 'CONFIGURE',
  dragHint: 'DRAG TO EXPLORE',
  dragLabel: '360°',
}

export const SCENE_BODY = {
  label: 'AERODYNAMIC FORM · ACTIVE SURFACES · CARBON ARCHITECTURE',
  headlineLines: ['SCULPTED', 'BY SPEED.'],
}

export const SCENE_WHEELS = {
  headlineLines: ['PRECISION', 'AT EVERY', 'TURN.'],
  callouts: [
    { value: '21"', label: 'FORGED ALLOY' },
    { value: '420 MM', label: 'CARBON CERAMIC' },
    { value: '1.08 G', label: 'LATERAL GRIP' },
  ],
}

export const SCENE_LIGHT = {
  headlineLines: ['LIGHT', 'WITH INTENT.'],
}

export const SCENE_INTERIOR = {
  headlineLines: ['YOUR', 'COCKPIT.'],
  details: ['DRIVER-CENTRIC DISPLAY', 'PERFORMANCE SEATING', 'TACTILE CONTROLS'],
}

export const STATS = [
  { value: '3.1', unit: 'S', label: '0–100 KM/H' },
  { value: '680', unit: 'HP', label: 'SYSTEM OUTPUT' },
  { value: '320', unit: 'KM/H', label: 'TOP SPEED' },
  { value: '950', unit: 'NM', label: 'TORQUE' },
]

export const BODY_COLORS = [
  // Obsidian is a gloss-black *dielectric* paint. As a metal (0.9) its
  // reflectance would be its own near-black base colour (~0.3%), removing the
  // ~4% Fresnel reflection every real black finish has and leaving only the
  // clearcoat to show the shape. Hex and roughness unchanged.
  { id: 'obsidian', name: 'Obsidian Black', hex: '#0a0a0b', metalness: 0.15, roughness: 0.32 },
  { id: 'titanium', name: 'Titanium Silver', hex: '#c7c8ca', metalness: 0.95, roughness: 0.28 },
  { id: 'aurex-red', name: 'Aurex Red', hex: '#6e0f16', metalness: 0.75, roughness: 0.3 },
  { id: 'arctic', name: 'Arctic White', hex: '#eef0ee', metalness: 0.6, roughness: 0.3 },
]

export const WHEEL_OPTIONS = [
  { id: 'forged-01', name: 'Option 01', spokes: 5, style: 'blade' },
  { id: 'forged-02', name: 'Option 02', spokes: 10, style: 'mesh' },
  { id: 'forged-03', name: 'Option 03', spokes: 7, style: 'turbine' },
]

export const INTERIOR_COLORS = [
  { id: 'onyx', name: 'ONYX', hex: '#0c0c0d', accent: '#3a3a3d' },
  { id: 'tan', name: 'TAN', hex: '#b79b73', accent: '#6f5a3e' },
  { id: 'crimson', name: 'CRIMSON', hex: '#3d0c10', accent: '#7a1620' },
]

export const PRICE_JOD = '89,900'

export const CONFIGURATOR = {
  headlineLines: ['MAKE IT', 'YOURS.'],
  ctaPrimary: 'RESERVE YOUR ONE',
  ctaSecondary: 'BOOK PRIVATE VIEWING',
}

export const FINAL = {
  headlineLines: ['MAKE', 'NO', 'COMPROMISE.'],
  model: 'AUREX ONE',
  cta: 'BOOK A PRIVATE VIEWING',
}

export const BRAND = {
  name: 'AUREX',
  location: 'AMMAN / JORDAN',
}

// The 3D vehicle is adapted from a CC-BY 4.0 asset; the licence requires this
// credit to stay visible wherever the site is published (shown in the footer).
export const MODEL_CREDIT = {
  title: 'Car Concept',
  author: 'Eric Chadwick / Darmstadt Graphics Group (Khronos glTF Sample Assets)',
  sourceUrl: 'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
}
