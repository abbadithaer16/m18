import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { sceneState, pointerState } from '../state/sceneState'
import { damp } from './maths'

/**
 * Dark automotive-studio environment: a procedurally baked light-probe
 * (no external HDRI fetch — keeps the build self-contained and fast),
 * two soft key/rim spotlights that respond to scroll progress, a subtly
 * reflective floor, and a couple of slow-drifting reflection strips.
 */
// SpotLight intensity is candela with inverse-square falloff (decay 2) since
// three r155; there is no legacy-units switch any more. The scroll keyframes
// express key/rim as unitless levels (~0.3–1.25), so convert each level into
// a target illuminance at the car (lux) and then into candela for the
// light's actual distance. Previously the raw level × 6.5 was used directly
// as candela: at ~8 units from the car that is /63, so the key and rim lights
// contributed almost nothing and the car was lit by the environment alone.
export const FOG_NEAR = 9
export const FOG_FAR = 26

const KEY_POS = [3.4, 6, 4]
const RIM_POS = [-4.5, 3, -5]
const KEY_LUX_PER_LEVEL = 2.4
const RIM_LUX_PER_LEVEL = 2.0
const distSq = ([x, y, z]) => x * x + y * y + z * z
const KEY_D2 = distSq(KEY_POS)
const RIM_D2 = distSq(RIM_POS)
// `light.env` keyframes (0.2–0.7) scale scene.environmentIntensity. Note that
// with scene.environment set, three overrides each material's own
// envMapIntensity with this value, so this is the one knob for IBL strength.
const ENV_PER_LEVEL = 1.8

export default function Studio({ highQuality = true }) {
  const keyRef = useRef(null)
  const rimRef = useRef(null)
  const fillRef = useRef(null)
  const floorMatRef = useRef(null)
  const stripA = useRef(null)
  const stripB = useRef(null)

  useFrame((state, dt) => {
    const { light } = sceneState
    state.scene.environmentIntensity = damp(state.scene.environmentIntensity, light.env * ENV_PER_LEVEL, 4, dt)
    if (keyRef.current) {
      keyRef.current.intensity = damp(keyRef.current.intensity, light.key * KEY_LUX_PER_LEVEL * KEY_D2, 6, dt)
      keyRef.current.position.x = damp(keyRef.current.position.x, 3.4 + pointerState.x * 0.6, 4, dt)
    }
    if (rimRef.current) {
      rimRef.current.intensity = damp(rimRef.current.intensity, light.rim * RIM_LUX_PER_LEVEL * RIM_D2, 6, dt)
    }
    if (fillRef.current) {
      fillRef.current.intensity = damp(fillRef.current.intensity, light.fill * 0.6, 6, dt)
    }
    if (floorMatRef.current) {
      floorMatRef.current.opacity = damp(floorMatRef.current.opacity, light.floor, 5, dt)
    }

    const t = state.clock.getElapsedTime()
    if (stripA.current) stripA.current.position.x = -3 + Math.sin(t * 0.12) * 1.4
    if (stripB.current) stripB.current.position.x = 3.2 + Math.sin(t * 0.09 + 2) * 1.6
  })

  return (
    <>
      <color attach="background" args={['#020202']} />
      <fog attach="fog" args={['#020202', FOG_NEAR, FOG_FAR]} />

      <Environment resolution={highQuality ? 256 : 128} frames={1}>
        <Lightformer form="rect" intensity={4.5} color="#ffffff" position={[0, 5, -4]} scale={[8, 4, 1]} />
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#ffffff"
          position={[-6, 2.5, 3]}
          rotation={[0, Math.PI / 2.6, 0]}
          scale={[5, 2.5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.3}
          color="#b3121c"
          position={[6, 1.4, 2]}
          rotation={[0, -Math.PI / 2.6, 0]}
          scale={[3, 1.2, 1]}
        />
        {/* Low, wide softbox in front of the car. Gloss black paint shows
            almost nothing but its reflections, and the flank faces the
            camera and reflects slightly downward, where the probe was pure
            #050505, so the whole side read as a flat black void. This
            gives the flank a soft horizon line without lifting exposure. */}
        <Lightformer form="rect" intensity={0.55} color="#ffffff" position={[0, -0.9, 6]} scale={[16, 0.8, 1]} />
        <mesh scale={80}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#050505" side={THREE.BackSide} />
        </mesh>
      </Environment>

      <hemisphereLight args={['#3a3d45', '#020202', 0.18]} />
      <ambientLight ref={fillRef} intensity={0.2} />

      <spotLight
        ref={keyRef}
        position={KEY_POS}
        angle={0.5}
        penumbra={0.9}
        intensity={0}
        color="#f5f2ea"
        castShadow={highQuality}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <spotLight
        ref={rimRef}
        position={RIM_POS}
        angle={0.6}
        penumbra={1}
        intensity={0}
        color="#cfd6e0"
      />

      {/* slow drifting reflection strips — visible bars + subtle atmosphere */}
      <mesh ref={stripA} position={[-3, 3.2, -3]} rotation={[0, 0.3, 0]}>
        <planeGeometry args={[3.2, 0.12]} />
        <meshBasicMaterial color="#e9e6dd" transparent opacity={0.35} />
      </mesh>
      <mesh ref={stripB} position={[3.2, 2.4, -4]} rotation={[0, -0.25, 0]}>
        <planeGeometry args={[2.6, 0.1]} />
        <meshBasicMaterial color="#c7cdd6" transparent opacity={0.22} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <MeshReflectorMaterial
          ref={floorMatRef}
          blur={highQuality ? [180, 50] : [0, 0]}
          resolution={highQuality ? 256 : 128}
          mixBlur={1}
          mixStrength={22}
          roughness={1}
          depthScale={1}
          minDepthThreshold={0.85}
          maxDepthThreshold={1.4}
          color="#050505"
          metalness={0.4}
          mirror={0}
          transparent
          opacity={0.32}
        />
      </mesh>
    </>
  )
}
