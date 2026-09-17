// Procedural loft geometry for the vehicle body. The previous body was a
// single 2D side-profile swept along the width axis — constant width for
// the whole length, which reads fine from a 3/4 angle but collapses into a
// featureless rolled-sheet-metal tube from anywhere near front/rear-on,
// and can't represent an endurance-prototype silhouette (narrow central
// tub, dramatically flared fenders around each wheel) at all.
//
// A loft fixes this properly: a series of cross-section "stations" along
// the car's length, each with its own half-width/floor/shoulder/roof, are
// connected into a triangulated hull. Width now varies station-to-station,
// so the fender flares are real 3D geometry, not a decal.

import * as THREE from 'three'

/**
 * One half-profile of a cross-section, from the centerline out to the
 * widest point (the "shoulder") and back to the centerline on the other
 * side — a rounded, lens-like ring when `domeOnly` is false (used for the
 * main body tub, symmetric top and bottom), or just the upper arc when
 * `domeOnly` is true (used for the canopy, which has no underside of its
 * own — it sits flush on the tub's roof).
 */
function crossSectionRing({
  halfWidth,
  floorY,
  // Dome-only rings (the canopy) don't have a lower arc, so callers can
  // omit shoulderY entirely — it collapses to floorY, meaning the upper
  // (only) arc starts right at the base rather than reading `undefined`
  // and poisoning every y coordinate with NaN.
  shoulderY = floorY,
  roofY,
  domeOnly = false,
  lowerSegments = 5,
  upperSegments = 6,
}) {
  const pts = []

  if (!domeOnly) {
    for (let i = 0; i <= lowerSegments; i++) {
      const theta = (i / lowerSegments) * (Math.PI / 2)
      pts.push({
        z: halfWidth * Math.sin(theta),
        y: floorY + (shoulderY - floorY) * (1 - Math.cos(theta)),
      })
    }
  } else {
    pts.push({ z: halfWidth, y: floorY })
  }

  const startI = domeOnly ? 0 : 1
  for (let i = startI; i <= upperSegments; i++) {
    const theta = (i / upperSegments) * (Math.PI / 2)
    pts.push({
      z: halfWidth * Math.cos(theta),
      y: shoulderY + (roofY - shoulderY) * Math.sin(theta),
    })
  }

  if (domeOnly) {
    // Open arc from +Z edge over the top to -Z edge — no centerline points,
    // so the loft leaves the underside open (it's glued to the tub roof).
    const mirrored = []
    for (let i = pts.length - 2; i >= 0; i--) mirrored.push({ z: -pts[i].z, y: pts[i].y })
    return { points: [...pts, ...mirrored], closed: false }
  }

  // Full ring: centerline -> shoulder -> centerline, then mirror the +Z
  // half (excluding both centerline endpoints, which are shared/on-axis)
  // to build the -Z half. The ring closes cyclically back to points[0].
  const mirrored = []
  for (let i = pts.length - 2; i >= 1; i--) mirrored.push({ z: -pts[i].z, y: pts[i].y })
  return { points: [...pts, ...mirrored], closed: true }
}

/**
 * Builds a triangulated BufferGeometry lofting through `stations` (each
 * `{ x, ...crossSectionRing params }`, ordered along X). Consecutive
 * stations must produce same-length rings (true whenever their params
 * share the same segment counts and `domeOnly`, which every call site
 * here does). End stations are capped with a fan from their own centroid
 * unless `openEnds` is set (used for the canopy, whose front/back edges
 * are thin enough to leave unfaced).
 */
export function buildLoftGeometry(stations, { openEnds = false } = {}) {
  const rings = stations.map((s) => ({ x: s.x, ...crossSectionRing(s) }))
  const closed = rings[0].closed

  const positions = []
  const indices = []
  const ringStartIndex = []

  rings.forEach((ring) => {
    ringStartIndex.push(positions.length / 3)
    ring.points.forEach((p) => positions.push(ring.x, p.y, p.z))
  })

  const n = rings[0].points.length
  for (let r = 0; r < rings.length - 1; r++) {
    const a0 = ringStartIndex[r]
    const b0 = ringStartIndex[r + 1]
    const segCount = closed ? n : n - 1
    for (let i = 0; i < segCount; i++) {
      const ai = a0 + i
      const an = a0 + ((i + 1) % n)
      const bi = b0 + i
      const bn = b0 + ((i + 1) % n)
      // Two triangles per quad, wound for an outward-facing normal.
      indices.push(ai, bi, bn)
      indices.push(ai, bn, an)
    }
  }

  if (!openEnds) {
    const capFan = (ring, startIdx, flip) => {
      const cx = ring.points.reduce((sum, p) => sum + p.z, 0) / ring.points.length
      const cy = ring.points.reduce((sum, p) => sum + p.y, 0) / ring.points.length
      const centerIdx = positions.length / 3
      positions.push(ring.x, cy, cx)
      for (let i = 0; i < n; i++) {
        const a = startIdx + i
        const b = startIdx + ((i + 1) % n)
        if (flip) indices.push(centerIdx, b, a)
        else indices.push(centerIdx, a, b)
      }
    }
    capFan(rings[0], ringStartIndex[0], true)
    capFan(rings[rings.length - 1], ringStartIndex[rings.length - 1], false)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}
