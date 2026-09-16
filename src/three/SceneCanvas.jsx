import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import Experience from './Experience'
import { sceneState } from '../state/sceneState'
import { polarToCartesian } from './cameraRig'

/**
 * Hosts the persistent, fixed-position WebGL canvas behind the whole page.
 * Isolated here so `App.jsx` stays a plain layout composition and the
 * render/perf configuration for Three.js lives in one obvious place.
 */
export default function SceneCanvas({ bodyColor, wheelOption, interiorColor, isMobile }) {
  const [dprCap, setDprCap] = useState(isMobile ? 1.5 : 2)
  const { x, y, z } = polarToCartesian(
    sceneState.camera.angle,
    sceneState.camera.radius,
    sceneState.camera.height,
    sceneState.camera.lx,
    sceneState.camera.lz,
  )

  return (
    <Canvas
      shadows={!isMobile}
      dpr={[1, dprCap]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{
        position: [x, y, z],
        fov: sceneState.camera.fov,
        near: 0.1,
        far: 60,
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = sceneState.light.exposure
      }}
    >
      <PerformanceMonitor onDecline={() => setDprCap((d) => Math.max(1, d - 0.5))} />
      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />
      <Suspense fallback={null}>
        <Experience
          bodyColor={bodyColor}
          wheelOption={wheelOption}
          interiorColor={interiorColor}
          highQuality={!isMobile}
        />
      </Suspense>
    </Canvas>
  )
}
