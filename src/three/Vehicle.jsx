import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import Wheel from './Wheel'
import Cockpit from './Cockpit'
import { buildLoftGeometry } from './bodyGeometry'
import { GLASS, GLOSS_BLACK, CARBON_FIBER } from './palette'
import { sceneState } from '../state/sceneState'

export const FRONT_AXLE_X = 1.75
export const REAR_AXLE_X = -1.85
export const TRACK_Z = 0.95
// Matches Wheel.jsx's TIRE_RADIUS + TIRE_TUBE (tire outer radius), so the
// tire's bottom edge sits exactly on the floor plane.
export const WHEEL_Y = 0.29

// Endurance-prototype silhouette: a narrow central tub (so it doesn't read
// as a slab from the front/rear) that flares dramatically at each wheel —
// the fender bulge is real loft geometry, not a decal — tapering to a low,
// sharp nose and a long tail. Modeled after the proportions of an LMP-style
// prototype (low nose, wide front track, wasp-waisted tub, wide rear
// haunches, long tail) without reproducing any specific car's panel lines,
// livery, or badging — an original silhouette in that idiom.
//
// Heights are calibrated against the wheel: real LMP tire diameter runs
// roughly 65% of overall car height, so the fender-peak stations (right at
// each axle) are sized to just clear the tire's top (WHEEL_Y + tire outer
// radius = 0.58) rather than being tuned in isolation — the wheel getting
// taller than the cabin roof was the first pass's actual bug.
const TUB_STATIONS = [
  { x: 2.75, halfWidth: 0.05, floorY: 0.1, shoulderY: 0.13, roofY: 0.16 }, // nose tip
  { x: 2.45, halfWidth: 0.48, floorY: 0.02, shoulderY: 0.19, roofY: 0.26 }, // splitter/nose underbody
  { x: 2.15, halfWidth: 0.58, floorY: 0.03, shoulderY: 0.28, roofY: 0.38 },
  { x: 1.95, halfWidth: 0.74, floorY: 0.04, shoulderY: 0.38, roofY: 0.48 }, // fender ramp-up
  { x: FRONT_AXLE_X, halfWidth: 0.98, floorY: 0.05, shoulderY: 0.54, roofY: 0.62 }, // front fender peak
  { x: 1.55, halfWidth: 0.8, floorY: 0.05, shoulderY: 0.44, roofY: 0.54 }, // fender ramp-down
  { x: 1.3, halfWidth: 0.64, floorY: 0.04, shoulderY: 0.36, roofY: 0.5 },
  { x: 0.95, halfWidth: 0.6, floorY: 0.03, shoulderY: 0.32, roofY: 0.52 },
  { x: 0.4, halfWidth: 0.58, floorY: 0.03, shoulderY: 0.3, roofY: 0.54 }, // tub waist
  { x: -0.35, halfWidth: 0.58, floorY: 0.03, shoulderY: 0.3, roofY: 0.52 }, // tub waist
  { x: -1.0, halfWidth: 0.62, floorY: 0.03, shoulderY: 0.34, roofY: 0.48 },
  { x: -1.3, halfWidth: 0.76, floorY: 0.04, shoulderY: 0.42, roofY: 0.46 }, // fender ramp-up
  { x: -1.55, halfWidth: 0.9, floorY: 0.05, shoulderY: 0.5, roofY: 0.52 },
  { x: REAR_AXLE_X, halfWidth: 1.0, floorY: 0.05, shoulderY: 0.58, roofY: 0.64 }, // rear fender peak
  { x: -2.1, halfWidth: 0.8, floorY: 0.05, shoulderY: 0.44, roofY: 0.46 }, // fender ramp-down
  { x: -2.35, halfWidth: 0.6, floorY: 0.05, shoulderY: 0.32, roofY: 0.34 },
  { x: -2.7, halfWidth: 0.1, floorY: 0.08, shoulderY: 0.14, roofY: 0.18 }, // tail tip
]

// Low, sleek cockpit bubble — a dome-only loft (no underside; it sits
// flush on the tub's roof line) so the greenhouse reads as glass set into
// the bodywork rather than a separate canopy floating on top. Its peak
// (0.86) is the tallest point on the car, clearly above the fender peaks
// (0.66) — the greenhouse-rises-above-the-fenders read that sells the
// silhouette as a cockpit sitting low in a wide chassis.
const CANOPY_STATIONS = [
  { x: 0.75, halfWidth: 0.05, floorY: 0.56, roofY: 0.58 },
  { x: 0.45, halfWidth: 0.4, floorY: 0.56, roofY: 0.78 },
  { x: 0.05, halfWidth: 0.44, floorY: 0.55, roofY: 0.86 },
  { x: -0.35, halfWidth: 0.4, floorY: 0.54, roofY: 0.76 },
  { x: -0.7, halfWidth: 0.06, floorY: 0.5, roofY: 0.54 },
]

export default function Vehicle({ bodyColor, wheelOption, interiorColor }) {
  const paintMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: bodyColor.hex,
        metalness: bodyColor.metalness,
        roughness: bodyColor.roughness,
        clearcoat: 1,
        clearcoatRoughness: 0.14,
        envMapIntensity: 1.1,
      }),
    // Only ever constructed once — later color changes are tweened in place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const glossBlack = useMemo(() => new THREE.MeshStandardMaterial(GLOSS_BLACK), [])
  const carbon = useMemo(() => new THREE.MeshPhysicalMaterial(CARBON_FIBER), [])
  const glass = useMemo(
    () => new THREE.MeshPhysicalMaterial({ ...GLASS, side: THREE.DoubleSide }),
    [],
  )

  const headlightMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#fff8ec',
        emissive: '#fff2da',
        emissiveIntensity: 0.15,
        roughness: 0.3,
      }),
    [],
  )
  const taillightMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3a0406',
        emissive: '#ff1620',
        emissiveIntensity: 0.35,
        roughness: 0.35,
      }),
    [],
  )

  const bodyGeometry = useMemo(() => buildLoftGeometry(TUB_STATIONS), [])
  const canopyGeometry = useMemo(() => buildLoftGeometry(CANOPY_STATIONS, { openEnds: true }), [])

  // Smoothly tween the paint whenever the configurator selection changes
  // (skips the tween on first mount so the car doesn't "flash" in). ~650ms
  // is the target window from the brief; a coordinated light pulse rides
  // alongside it so the change reads as a controlled studio reveal rather
  // than the color simply drifting.
  const prevColorId = useRef(bodyColor.id)
  useEffect(() => {
    if (prevColorId.current === bodyColor.id) return
    prevColorId.current = bodyColor.id
    const target = new THREE.Color(bodyColor.hex)
    gsap.to(paintMaterial.color, {
      r: target.r,
      g: target.g,
      b: target.b,
      duration: 0.65,
      ease: 'power2.inOut',
    })
    gsap.to(paintMaterial, {
      metalness: bodyColor.metalness,
      roughness: bodyColor.roughness,
      duration: 0.65,
      ease: 'power2.inOut',
    })
    const keyBefore = sceneState.light.key
    const envBefore = sceneState.light.env
    gsap.to(sceneState.light, {
      key: keyBefore * 1.4,
      env: envBefore * 1.25,
      duration: 0.3,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    })
  }, [bodyColor, paintMaterial])

  useFrame(() => {
    headlightMat.emissiveIntensity = sceneState.headlight.intensity
    taillightMat.emissiveIntensity = sceneState.taillight.intensity
  })

  const wheelLayout = [
    { position: [FRONT_AXLE_X, WHEEL_Y, TRACK_Z], side: -1 },
    { position: [FRONT_AXLE_X, WHEEL_Y, -TRACK_Z], side: 1 },
    { position: [REAR_AXLE_X, WHEEL_Y, TRACK_Z], side: -1 },
    { position: [REAR_AXLE_X, WHEEL_Y, -TRACK_Z], side: 1 },
  ]

  return (
    <group>
      <mesh geometry={bodyGeometry} material={paintMaterial} castShadow receiveShadow />
      <mesh geometry={canopyGeometry} material={glass} />

      {/* mirrors, just ahead of the canopy's leading edge */}
      <mesh position={[0.62, 0.62, 0.46]} material={glossBlack} castShadow>
        <boxGeometry args={[0.16, 0.05, 0.08]} />
      </mesh>
      <mesh position={[0.62, 0.62, -0.46]} material={glossBlack} castShadow>
        <boxGeometry args={[0.16, 0.05, 0.08]} />
      </mesh>

      {/* lower sill trim along the tub's waist */}
      <mesh position={[-0.15, 0.16, 0.6]} material={glossBlack}>
        <boxGeometry args={[3.5, 0.1, 0.04]} />
      </mesh>
      <mesh position={[-0.15, 0.16, -0.6]} material={glossBlack}>
        <boxGeometry args={[3.5, 0.1, 0.04]} />
      </mesh>

      {/* front splitter — wide, low, thin */}
      <mesh position={[2.68, 0.035, 0]} material={carbon} castShadow>
        <boxGeometry args={[0.34, 0.025, 1.66]} />
      </mesh>
      {/* front canards */}
      <mesh position={[2.3, 0.32, 0.56]} rotation={[0, -0.22, 0.05]} material={carbon}>
        <boxGeometry args={[0.22, 0.02, 0.24]} />
      </mesh>
      <mesh position={[2.3, 0.32, -0.56]} rotation={[0, 0.22, 0.05]} material={carbon}>
        <boxGeometry args={[0.22, 0.02, 0.24]} />
      </mesh>

      {/* slim angled headlight slits, tucked into the nose shoulders */}
      <mesh position={[2.34, 0.32, 0.44]} rotation={[0, 0, 0.32]} material={headlightMat}>
        <boxGeometry args={[0.32, 0.045, 0.09]} />
      </mesh>
      <mesh position={[2.34, 0.32, -0.44]} rotation={[0, 0, 0.32]} material={headlightMat}>
        <boxGeometry args={[0.32, 0.045, 0.09]} />
      </mesh>

      {/* slim vertical taillight slits at the rear corners */}
      <mesh position={[-2.22, 0.3, 0.58]} rotation={[0, 0, 0.1]} material={taillightMat}>
        <boxGeometry args={[0.05, 0.14, 0.08]} />
      </mesh>
      <mesh position={[-2.22, 0.3, -0.58]} rotation={[0, 0, 0.1]} material={taillightMat}>
        <boxGeometry args={[0.05, 0.14, 0.08]} />
      </mesh>

      {/* rear diffuser — base plate + fins under the tail kick-up, kept
          inside the tail's own width (halfWidth ~0.55-0.6 there) */}
      <mesh position={[-2.42, 0.11, 0]} material={carbon}>
        <boxGeometry args={[0.5, 0.03, 1.0]} />
      </mesh>
      {[-0.44, -0.22, 0, 0.22, 0.44].map((z) => (
        <mesh key={z} position={[-2.42, 0.16, z]} material={carbon}>
          <boxGeometry args={[0.48, 0.08, 0.03]} />
        </mesh>
      ))}

      {/* rear wing — struts, blade, endplates, mounted off the rear deck.
          Sized against the car's own 0.86 overall height: the endplate
          (0.14 tall) reads as a wing detail, not a second body panel. */}
      <mesh position={[-1.98, 0.72, 0.62]} material={carbon}>
        <boxGeometry args={[0.035, 0.2, 0.035]} />
      </mesh>
      <mesh position={[-1.98, 0.72, -0.62]} material={carbon}>
        <boxGeometry args={[0.035, 0.2, 0.035]} />
      </mesh>
      <mesh position={[-2.0, 0.84, 0]} rotation={[0.08, 0, 0]} material={carbon} castShadow>
        <boxGeometry args={[0.16, 0.02, 1.72]} />
      </mesh>
      <mesh position={[-2.0, 0.8, 0.85]} material={carbon}>
        <boxGeometry args={[0.17, 0.14, 0.015]} />
      </mesh>
      <mesh position={[-2.0, 0.8, -0.85]} material={carbon}>
        <boxGeometry args={[0.17, 0.14, 0.015]} />
      </mesh>

      {wheelLayout.map((w, i) => (
        <Wheel key={i} position={w.position} side={w.side} wheelOption={wheelOption} />
      ))}

      <Cockpit interiorColor={interiorColor} />
    </group>
  )
}
