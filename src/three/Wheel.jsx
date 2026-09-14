import { useMemo } from 'react'
import * as THREE from 'three'
import { BRUSHED_ALUMINUM, CALIPER_RED, DISC_METAL, GLOSS_BLACK, RUBBER } from './palette'

const tireMaterial = new THREE.MeshStandardMaterial(RUBBER)
const discMaterial = new THREE.MeshStandardMaterial(DISC_METAL)
const caliperMaterial = new THREE.MeshStandardMaterial(CALIPER_RED)
const hubMaterial = new THREE.MeshStandardMaterial(GLOSS_BLACK)

const RIM_MATERIAL_PARAMS = {
  blade: BRUSHED_ALUMINUM,
  mesh: { color: '#b7b8ba', metalness: 1, roughness: 0.42 },
  turbine: { color: '#95969a', metalness: 1, roughness: 0.3 },
}

const TIRE_RADIUS = 0.335
const TIRE_TUBE = 0.1
const RIM_RADIUS = 0.235

/**
 * Wheel assembly: tire + forged rim (spoke style driven by `wheelOption`) +
 * brake disc + caliper. Kept as its own component so the configurator can
 * swap geometry per-corner without touching the body.
 */
export default function Wheel({ position, side = 1, wheelOption }) {
  const spokeCount = wheelOption?.spokes ?? 5
  const style = wheelOption?.style ?? 'blade'

  const rimMaterial = useMemo(
    () => new THREE.MeshStandardMaterial(RIM_MATERIAL_PARAMS[style] ?? RIM_MATERIAL_PARAMS.blade),
    [style],
  )

  const spokeAngles = useMemo(
    () => Array.from({ length: spokeCount }, (_, i) => (i / spokeCount) * Math.PI * 2),
    [spokeCount],
  )

  const spokeWidth = style === 'mesh' ? 0.05 : style === 'turbine' ? 0.12 : 0.075

  return (
    <group position={position}>
      <mesh material={tireMaterial} castShadow receiveShadow>
        <torusGeometry args={[TIRE_RADIUS, TIRE_TUBE, 14, 28]} />
      </mesh>

      <mesh material={rimMaterial} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[RIM_RADIUS, RIM_RADIUS * 0.96, 0.15, 24, 1, true]} />
      </mesh>

      <mesh material={rimMaterial}>
        <torusGeometry args={[RIM_RADIUS, 0.022, 10, 28]} />
      </mesh>

      {spokeAngles.map((angle) => (
        <group key={angle} rotation={[0, 0, angle]}>
          <mesh position={[RIM_RADIUS * 0.5, 0, 0]} material={rimMaterial}>
            <boxGeometry args={[RIM_RADIUS * 0.86, spokeWidth, 0.05]} />
          </mesh>
        </group>
      ))}

      <mesh material={hubMaterial} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.062, 0.062, 0.17, 16]} />
      </mesh>

      <mesh material={discMaterial} position={[0, 0, side * 0.085]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.225, 0.225, 0.018, 28]} />
      </mesh>

      <mesh material={caliperMaterial} position={[0.09, 0.15, side * 0.085]}>
        <boxGeometry args={[0.17, 0.13, 0.095]} />
      </mesh>
    </group>
  )
}
