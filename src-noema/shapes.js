// Procedural point clouds for the three NOEMA states. Every shape gets the
// same number of points so the shader can morph point i of one shape into
// point i of the next. Deterministic (seeded) so reloads look the same.

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gaussian(rand) {
  const u = Math.max(rand(), 1e-9)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
}

function unitVector(rand) {
  const z = rand() * 2 - 1
  const t = rand() * Math.PI * 2
  const r = Math.sqrt(1 - z * z)
  return [r * Math.cos(t), z, r * Math.sin(t)]
}

/** Listening: a soft, lumpy orb, denser towards its skin. */
function orb(i, rand, out) {
  const [x, y, z] = unitVector(rand)
  const lumps = 0.09 * Math.sin(3 * x + 2 * y) * Math.cos(4 * z - y)
  const r = 1.18 * (0.62 + 0.38 * Math.cbrt(rand())) * (1 + lumps)
  out[0] = x * r
  out[1] = y * r
  out[2] = z * r
}

/** Thinking: a three-armed spiral galaxy with a bright core, seen at a tilt. */
function galaxy(i, rand, out) {
  const arms = 3
  const radius = 2.2
  const core = rand() < 0.16
  const r = core ? Math.abs(gaussian(rand)) * 0.28 : Math.pow(rand(), 0.75) * radius
  const arm = i % arms
  const spread = (0.12 + 0.3 * (r / radius)) * gaussian(rand)
  const angle = (arm / arms) * Math.PI * 2 + r * 2.1 + spread
  const thickness = 0.07 * (1 - r / radius) + 0.012
  const x = Math.cos(angle) * r + gaussian(rand) * 0.04
  const z = Math.sin(angle) * r + gaussian(rand) * 0.04
  const y = gaussian(rand) * thickness
  const tilt = -0.42
  out[0] = x
  out[1] = y * Math.cos(tilt) - z * Math.sin(tilt)
  out[2] = y * Math.sin(tilt) + z * Math.cos(tilt)
}

/** Remembering: two folded hemispheres, a cerebellum and a short stem, in profile. */
function brain(i, rand, out) {
  const pick = rand()
  let x
  let y
  let z
  if (pick < 0.86) {
    // Cerebrum: one hemisphere per side, surface displaced into gyri.
    const side = i % 2 === 0 ? 1 : -1
    const [nx, ny, nz] = unitVector(rand)
    const fold =
      0.085 * Math.sin(9 * nx + 7 * ny) * Math.sin(8 * nz + 5 * ny) +
      0.05 * Math.sin(15 * nz - 11 * ny + 4 * nx)
    const shell = 0.9 + 0.1 * rand() + fold
    x = side * 0.06 + nx * 0.62 * shell + side * 0.04
    y = ny * 0.78 * shell * (ny < 0 ? 0.78 : 1)
    z = nz * 1.18 * shell
    // Keep the two halves apart along the midline.
    if (Math.sign(x) !== side) x *= -0.35
  } else if (pick < 0.96) {
    // Cerebellum: a smaller, finely ridged lobe low at the back.
    const [nx, ny, nz] = unitVector(rand)
    const ridge = 0.06 * Math.sin(26 * ny)
    x = nx * 0.48 * (1 + ridge)
    y = -0.5 + ny * 0.26 * (1 + ridge)
    z = -0.78 + nz * 0.36 * (1 + ridge)
  } else {
    // Stem.
    const t = rand()
    const a = rand() * Math.PI * 2
    const rr = 0.11 * Math.sqrt(rand())
    x = Math.cos(a) * rr
    y = -0.55 - t * 0.6
    z = -0.32 - t * 0.18 + Math.sin(a) * rr
  }
  // Present in profile: front of the brain to the right.
  out[0] = z * 1.05
  out[1] = y + 0.08
  out[2] = -x
}

/**
 * Build attribute arrays for `count` points.
 * aSeed: 0–1 per point (stagger, size, twinkle). aHue: 0 = lumen mint, 1 = iris violet.
 */
export function buildField(count) {
  const rand = mulberry32(20261102)
  const orbArr = new Float32Array(count * 3)
  const galaxyArr = new Float32Array(count * 3)
  const brainArr = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  const hue = new Float32Array(count)
  const tmp = [0, 0, 0]
  for (let i = 0; i < count; i++) {
    orb(i, rand, tmp)
    orbArr.set(tmp, i * 3)
    galaxy(i, rand, tmp)
    galaxyArr.set(tmp, i * 3)
    brain(i, rand, tmp)
    brainArr.set(tmp, i * 3)
    seed[i] = rand()
    // Mostly mint with violet drifts, biased by orb height so colour reads as light, not noise.
    const bias = (orbArr[i * 3 + 1] / 1.2) * 0.35
    hue[i] = Math.min(1, Math.max(0, 0.38 + bias + (rand() - 0.5) * 0.9))
  }
  return { orb: orbArr, galaxy: galaxyArr, brain: brainArr, seed, hue }
}
