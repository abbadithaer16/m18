import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { BRUSHED_ALUMINUM, CALIPER_RED, DISC_METAL, GLOSS_BLACK, RUBBER } from './palette'
import { sceneState } from '../state/sceneState'
import { damp } from './maths'

const tireMaterial = new THREE.MeshStandardMaterial(RUBBER)
const discMaterial = new THREE.MeshStandardMaterial(DISC_METAL)
const caliperMaterial = new THREE.MeshStandardMaterial(CALIPER_RED)
const hubMaterial = new THREE.MeshStandardMaterial(GLOSS_BLACK)

const RIM_MATERIAL_PARAMS = {
  blade: BRUSHED_ALUMINUM,
  mesh: { color: '#b7b8ba', metalness: 1, roughness: 0.42 },
  turbine: { color: '#95969a', metalness: 1, roughness: 0.3 },
}

// Wide racing rubber, sized against the body: real LMP tire diameter runs
// roughly 65% of the car's overall height, and the fender-peak stations in
// Vehicle.jsx are cut to just clear this tire's outer radius (0.29) — the
// wheel ending up taller than the whole car was the first pass's bug.
// WHEEL_Y there is set to TIRE_RADIUS + TIRE_TUBE so the tire's outer edge
// sits exactly on the floor plane.
const TIRE_RADIUS = 0.18
const TIRE_TUBE = 0.11
const RIM_RADIUS = 0.13

/**
 * Wheel assembly: tire + forged rim (spoke style driven by `wheelOption`) +
 * brake disc + caliper. Kept as its own component so the configurator can
 * swap geometry per-corner without touching the body.
 *
 * Tire/rim/spokes/hub/disc live in an inner group that rotates about the
 * axle (local Z, matching the mesh-level rotations below) — driven by
 * `sceneState.wheelSpin`, tiny and scroll-tied (the wheel macro scene), not
 * a continuous "driving" animation. The caliper stays in the outer,
 * non-spinning group, as it does on a real car.
 *
 * A geometry swap (spoke style/count) can't be tweened directly, so the
 * displayed option lags the real `wheelOption` prop by one quick scale
 * dip: the assembly contracts, the geometry swaps at the trough (hidden by
 * its own minimum size), then it expands back out — a fast, mechanical-
 * feeling transition rather than an instant pop.
 */
export default function Wheel({ position, side = 1, wheelOption }) {
  const spinRef = useRef(null)
  const swapRef = useRef(null)
  const [displayedOption, setDisplayedOption] = useState(wheelOption)
  const prevOptionId = useRef(wheelOption?.id)

  useEffect(() => {
    if (prevOptionId.current === wheelOption?.id) return
    prevOptionId.current = wheelOption?.id
    const tl = gsap.timeline()
    tl.to(swapRef.current.scale, { x: 0.86, y: 0.86, z: 0.86, duration: 0.14, ease: 'power2.in' })
    tl.call(() => setDisplayedOption(wheelOption))
    tl.to(swapRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.16, ease: 'power2.out' })
  }, [wheelOption])

  const spokeCount = displayedOption?.spokes ?? 5
  const style = displayedOption?.style ?? 'blade'

  const rimMaterial = useMemo(
    () => new THREE.MeshStandardMaterial(RIM_MATERIAL_PARAMS[style] ?? RIM_MATERIAL_PARAMS.blade),
    [style],
  )

  const spokeAngles = useMemo(
    () => Array.from({ length: spokeCount }, (_, i) => (i / spokeCount) * Math.PI * 2),
    [spokeCount],
  )

  const spokeWidth = style === 'mesh' ? 0.028 : style === 'turbine' ? 0.066 : 0.042

  useFrame((_, dt) => {
    if (!spinRef.current) return
    spinRef.current.rotation.z = damp(spinRef.current.rotation.z, sceneState.wheelSpin.angle, 5, dt)
  })

  return (
    <group position={position} ref={swapRef}>
      <group ref={spinRef}>
        <mesh material={tireMaterial} castShadow receiveShadow>
          <torusGeometry args={[TIRE_RADIUS, TIRE_TUBE, 14, 28]} />
        </mesh>

        <mesh material={rimMaterial} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[RIM_RADIUS, RIM_RADIUS * 0.96, 0.16, 24, 1, true]} />
        </mesh>

        <mesh material={rimMaterial}>
          <torusGeometry args={[RIM_RADIUS, 0.016, 10, 28]} />
        </mesh>

        {spokeAngles.map((angle) => (
          <group key={angle} rotation={[0, 0, angle]}>
            <mesh position={[RIM_RADIUS * 0.5, 0, 0]} material={rimMaterial}>
              <boxGeometry args={[RIM_RADIUS * 0.86, spokeWidth, 0.045]} />
            </mesh>
          </group>
        ))}

        <mesh material={hubMaterial} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.16, 16]} />
        </mesh>

        <mesh material={discMaterial} position={[0, 0, side * 0.075]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.115, 0.115, 0.014, 28]} />
        </mesh>
      </group>

      <mesh material={caliperMaterial} position={[0.06, 0.09, side * 0.075]}>
        <boxGeometry args={[0.11, 0.085, 0.06]} />
      </mesh>
    </group>
  )
}
