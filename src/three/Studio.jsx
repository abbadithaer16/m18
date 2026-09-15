import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { sceneState, pointerState, sweepState } from '../state/sceneState'
import { damp, lerp } from './maths'

/**
 * Dark automotive-studio environment: a procedurally baked light-probe
 * (no external HDRI fetch — keeps the build self-contained and fast), two
 * soft key/rim spotlights that respond to scroll progress *and* pointer
 * position (the moving position is what paints a live specular sweep
 * across the car's clearcoat), a subtly reflective floor, and reflection
 * strips that travel with the hero's scroll-tied sweep / pointer parallax
 * rather than drifting on an idle clock.
 */
export default function Studio({ highQuality = true }) {
  const keyRef = useRef(null)
  const rimRef = useRef(null)
  const fillRef = useRef(null)
  const floorMatRef = useRef(null)
  const stripA = useRef(null)
  const stripB = useRef(null)

  useFrame((_, dt) => {
    const { light } = sceneState
    // The key light's position is what actually paints a moving specular
    // highlight across the clearcoat (direct-light BRDF, not the baked
    // env probe) — this is the "reflection travels across the paint"
    // surface, driven by two real inputs rather than a fake overlay: the
    // hero's scroll-tied sweep across the hood/shoulder, and ambient
    // pointer parallax for hover interactivity.
    const sweep = sweepState.progress
    const keyTargetX = lerp(1.7, 4.6, sweep) + pointerState.x * 0.75
    const keyTargetY = lerp(7.1, 5.3, sweep) + pointerState.y * -0.25
    const sweepBoost = 1 + Math.sin(THREE.MathUtils.clamp(sweep, 0, 1) * Math.PI) * 0.16

    if (keyRef.current) {
      keyRef.current.intensity = damp(keyRef.current.intensity, light.key * 6.5 * sweepBoost, 6, dt)
      keyRef.current.position.x = damp(keyRef.current.position.x, keyTargetX, 3.4, dt)
      keyRef.current.position.y = damp(keyRef.current.position.y, keyTargetY, 3.4, dt)
    }
    if (rimRef.current) {
      rimRef.current.intensity = damp(rimRef.current.intensity, light.rim * 5, 6, dt)
      rimRef.current.position.x = damp(rimRef.current.position.x, -4.5 + pointerState.x * -0.5, 3.4, dt)
    }
    if (fillRef.current) {
      fillRef.current.intensity = damp(fillRef.current.intensity, light.fill * 0.6, 6, dt)
    }
    if (floorMatRef.current) {
      floorMatRef.current.opacity = damp(floorMatRef.current.opacity, light.floor, 5, dt)
    }

    // Background reflection bars: a primary strip travels with the hero's
    // hood/shoulder sweep (never idle on its own), a secondary strip only
    // ever answers pointer parallax — both physically motivated, neither
    // running on an autonomous clock.
    if (stripA.current) {
      stripA.current.position.x = lerp(-4.2, 4.2, sweep) + pointerState.x * 0.5
      stripA.current.material.opacity = 0.22 + sweepBoost * 0.16
    }
    if (stripB.current) {
      stripB.current.position.x = 3.2 + pointerState.x * 0.9
      stripB.current.position.y = 2.4 + pointerState.y * -0.3
    }
  })

  return (
    <>
      <color attach="background" args={['#020202']} />
      <fog attach="fog" args={['#020202', 9, 26]} />

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
        <mesh scale={80}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#050505" side={THREE.BackSide} />
        </mesh>
      </Environment>

      <hemisphereLight args={['#3a3d45', '#020202', 0.18]} />
      <ambientLight ref={fillRef} intensity={0.2} />

      <spotLight
        ref={keyRef}
        position={[3.4, 6, 4]}
        angle={0.5}
        penumbra={0.9}
        intensity={5}
        color="#f5f2ea"
        castShadow={highQuality}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <spotLight
        ref={rimRef}
        position={[-4.5, 3, -5]}
        angle={0.6}
        penumbra={1}
        intensity={4}
        color="#cfd6e0"
      />

      {/* reflection strips: primary tracks the hero sweep, secondary tracks pointer */}
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
