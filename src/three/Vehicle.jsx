import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import Wheel from './Wheel'
import Cockpit from './Cockpit'
import { GLASS, GLOSS_BLACK } from './palette'
import { sceneState } from '../state/sceneState'

const HALF_WIDTH = 0.97
const FRONT_AXLE_X = 1.5
const REAR_AXLE_X = -1.6
const WHEEL_Y = 0.335
const TRACK_Z = 0.82

// Side-profile silhouette (x = length, y = height), threaded through with a
// Catmull-Rom spline for sculpted, non-faceted surfaces. Extruded along the
// width axis to build the whole body in one pass — long hood, raked
// windshield, fastback roofline, tapering tail. Swap this component for a
// GLTFLoader-based one with the same prop signature once a licensed GLB is
// available.
function buildBodyShape() {
  const shape = new THREE.Shape()
  const pts = [
    [2.3, 0.2],
    [2.3, 0.42],
    [2.05, 0.5],
    [0.95, 0.56],
    [0.55, 0.62],
    [0.15, 1.02],
    [-0.35, 1.12],
    [-0.95, 1.0],
    [-1.45, 0.68],
    [-1.85, 0.52],
    [-2.3, 0.44],
    [-2.3, 0.2],
  ]
  shape.moveTo(pts[0][0], pts[0][1])
  shape.splineThru(pts.slice(1).map(([x, y]) => new THREE.Vector2(x, y)))
  return shape
}

// Greenhouse / glass canopy — a smaller shape inset from the body line so
// the cabin glass reads as recessed within the sheet metal.
function buildCanopyShape() {
  const shape = new THREE.Shape()
  const pts = [
    [0.5, 0.64],
    [0.13, 1.0],
    [-0.35, 1.09],
    [-0.9, 0.97],
    [-1.4, 0.66],
  ]
  shape.moveTo(pts[0][0], pts[0][1])
  shape.splineThru(pts.slice(1).map(([x, y]) => new THREE.Vector2(x, y)))
  return shape
}

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
        // The extruded silhouette's winding isn't guaranteed, so render
        // both faces rather than risk the shell being backface-culled.
        side: THREE.DoubleSide,
      }),
    // Only ever constructed once — later color changes are tweened in place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const glossBlack = useMemo(() => new THREE.MeshStandardMaterial(GLOSS_BLACK), [])
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

  const bodyGeometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(buildBodyShape(), {
      depth: HALF_WIDTH * 2,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.035,
      bevelSegments: 4,
      curveSegments: 32,
    })
    geo.translate(0, 0, -HALF_WIDTH)
    return geo
  }, [])

  const canopyGeometry = useMemo(() => {
    const inset = HALF_WIDTH * 0.82
    const geo = new THREE.ExtrudeGeometry(buildCanopyShape(), {
      depth: inset * 2,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.018,
      bevelSegments: 2,
      curveSegments: 24,
    })
    geo.translate(0, 0.008, -inset)
    return geo
  }, [])

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

      <mesh position={[0.38, 0.86, HALF_WIDTH - 0.01]} material={glossBlack} castShadow>
        <boxGeometry args={[0.18, 0.06, 0.09]} />
      </mesh>
      <mesh position={[0.38, 0.86, -(HALF_WIDTH - 0.01)]} material={glossBlack} castShadow>
        <boxGeometry args={[0.18, 0.06, 0.09]} />
      </mesh>

      <mesh position={[-0.15, 0.16, HALF_WIDTH - 0.015]} material={glossBlack}>
        <boxGeometry args={[3.55, 0.14, 0.05]} />
      </mesh>
      <mesh position={[-0.15, 0.16, -(HALF_WIDTH - 0.015)]} material={glossBlack}>
        <boxGeometry args={[3.55, 0.14, 0.05]} />
      </mesh>

      <mesh position={[2.36, 0.09, 0]} material={glossBlack}>
        <boxGeometry args={[0.12, 0.05, HALF_WIDTH * 1.9]} />
      </mesh>
      <mesh position={[-2.28, 0.14, 0]} material={glossBlack}>
        <boxGeometry args={[0.16, 0.16, HALF_WIDTH * 1.7]} />
      </mesh>

      <mesh position={[2.28, 0.42, 0.58]} material={headlightMat}>
        <boxGeometry args={[0.05, 0.09, 0.32]} />
      </mesh>
      <mesh position={[2.28, 0.42, -0.58]} material={headlightMat}>
        <boxGeometry args={[0.05, 0.09, 0.32]} />
      </mesh>

      <mesh position={[-2.2, 0.56, 0]} material={taillightMat}>
        <boxGeometry args={[0.05, 0.07, HALF_WIDTH * 1.75]} />
      </mesh>

      {wheelLayout.map((w, i) => (
        <mesh
          key={`arch-${i}`}
          position={[
            w.position[0],
            WHEEL_Y + 0.03,
            w.position[2] > 0 ? HALF_WIDTH - 0.015 : -(HALF_WIDTH - 0.015),
          ]}
          rotation={[0, 0, -Math.PI * 0.08]}
          material={glossBlack}
        >
          <torusGeometry args={[0.4, 0.05, 8, 20, Math.PI * 1.2]} />
        </mesh>
      ))}

      {wheelLayout.map((w, i) => (
        <Wheel key={i} position={w.position} side={w.side} wheelOption={wheelOption} />
      ))}

      <Cockpit interiorColor={interiorColor} />
    </group>
  )
}
