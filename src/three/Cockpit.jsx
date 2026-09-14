import { RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * Simplified, stylized cockpit — not an attempt at photoreal interior
 * modeling, but enough sculpted form + material contrast to read as
 * premium in the intimate interior scene. Coordinates are kept well
 * inside the cabin volume (roughly x: -1.3..0.4, y: 0.14..1.0) so nothing
 * pokes through the exterior shell. Swap for a GLB interior later without
 * touching the exterior body.
 */
export default function Cockpit({ interiorColor }) {
  const trimMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: interiorColor.hex, roughness: 0.72, metalness: 0.12 }),
    [interiorColor.hex],
  )
  const accentMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: interiorColor.accent, roughness: 0.4, metalness: 0.4 }),
    [interiorColor.accent],
  )
  const displayMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0a0a0c',
        emissive: '#8fa6ff',
        emissiveIntensity: 0.22,
        roughness: 0.3,
      }),
    [],
  )

  return (
    <group>
      {/* dash, tucked just behind the cowl */}
      <RoundedBox
        args={[0.22, 0.16, 1.5]}
        radius={0.04}
        smoothness={2}
        position={[0.28, 0.56, 0]}
        material={trimMaterial}
      />

      <mesh position={[0.33, 0.63, 0.3]} rotation={[-0.3, 0, 0]} material={displayMaterial}>
        <boxGeometry args={[0.015, 0.13, 0.26]} />
      </mesh>

      <group position={[0.18, 0.58, 0.3]} rotation={[0, Math.PI / 2, 0.1]}>
        <mesh material={accentMaterial}>
          <torusGeometry args={[0.14, 0.018, 8, 20]} />
        </mesh>
      </group>

      {[0.3, -0.3].map((z) => (
        <group key={z} position={[-0.85, 0.28, z]}>
          <RoundedBox args={[0.4, 0.16, 0.4]} radius={0.05} smoothness={2} position={[0, 0.08, 0]} material={trimMaterial} />
          <RoundedBox
            args={[0.08, 0.44, 0.38]}
            radius={0.05}
            smoothness={2}
            position={[-0.16, 0.28, 0]}
            rotation={[0, 0, -0.1]}
            material={trimMaterial}
          />
          <RoundedBox args={[0.03, 0.4, 0.32]} radius={0.02} smoothness={1} position={[-0.14, 0.3, 0]} material={accentMaterial} />
        </group>
      ))}
    </group>
  )
}
