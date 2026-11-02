import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import ProceduralVehicle from './ProceduralVehicle'
import { GLASS } from './palette'
import { sceneState } from '../state/sceneState'

/**
 * AUREX ONE — production model.
 *
 * Source: "Car Concept" from the Khronos glTF Sample Assets, by Eric Chadwick
 * / Darmstadt Graphics Group, CC-BY 4.0 (itself based on a CC0 model by
 * "Unity Fan"). Credited in the footer and README. The web asset in
 * public/models was prepared with gltf-transform: Khronos / 3D Commerce logos
 * removed from the plate and tyre-sidewall textures, material variants and
 * transmission dropped, textures capped at 1024 px as WebP, meshopt geometry.
 *
 * The model is authored at real scale, front towards +Z. The scroll camera
 * keyframes assume the front faces +X, so it is rotated a quarter turn; its
 * front axle then lands at x ≈ 1.49, matching the old procedural car's 1.5.
 */
const MODEL_URL = `${import.meta.env.BASE_URL}models/aurex-one.glb`
// Meshopt decoder is bundled; no Draco in this file, so don't wire the CDN decoder.
const USE_DRACO = false

const RIM_FINISHES = {
  'forged-01': { color: '#c9cacc', metalness: 1, roughness: 0.16 },
  'forged-02': { color: '#9a9a9c', metalness: 1, roughness: 0.3 },
  'forged-03': { color: '#6f7073', metalness: 1, roughness: 0.42 },
}

// Emissive strength of the source lamps relative to the old procedural lamp
// materials, which were driven 1:1 by sceneState.{head,tail}light.intensity.
const HEADLIGHT_GAIN = 1.6
const TAILLIGHT_GAIN = 1.4

function makePlateTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#050505'
  ctx.fillRect(0, 0, 512, 128)
  ctx.fillStyle = '#f4f1ea'
  ctx.font = "700 74px 'Big Shoulders Display', 'Arial Narrow', sans-serif"
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('AUREX', 256, 68)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.flipY = false // glTF UV convention
  return tex
}

function tweenMaterial(material, { color, metalness, roughness }, duration = 1.15) {
  const target = new THREE.Color(color)
  gsap.to(material.color, { r: target.r, g: target.g, b: target.b, duration, ease: 'power2.inOut', overwrite: true })
  gsap.to(material, { metalness, roughness, duration, ease: 'power2.inOut', overwrite: true })
}

function GltfVehicle({ bodyColor, wheelOption, interiorColor }) {
  const { scene, materials } = useGLTF(MODEL_URL, USE_DRACO, true)

  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({ ...GLASS, side: THREE.DoubleSide }), [])
  const plateTexture = useMemo(() => makePlateTexture(), [])

  // One-time material setup. useGLTF caches the parsed scene, so this is
  // written to be idempotent (React StrictMode mounts effects twice in dev).
  useLayoutEffect(() => {
    scene.traverse((obj) => {
      if (!obj.isMesh) return
      const isGlass = obj.material?.name === 'Glass'
      if (isGlass) obj.material = glass
      obj.castShadow = !isGlass
      obj.receiveShadow = !isGlass
    })
    const plate = materials.License
    if (plate) {
      plate.map = plateTexture
      plate.needsUpdate = true
    }
    // The secondary panels (sills, lower bumper, mirror caps) are a dark
    // clearcoated paint in the source; keep them as the AUREX gloss-black trim.
    if (materials['Paint 2 Carmine']) materials['Paint 2 Carmine'].color.set('#050505')
    // The source paints carry a 128px tiled metal-flake normal map. At web
    // viewing distances it is far below pixel size and renders as sparkling
    // noise, so the paints are left smooth; the clearcoat carries the gloss.
    for (const name of ['Paint 1 Carmine', 'Paint 2 Carmine']) {
      const m = materials[name]
      if (m?.normalMap) {
        m.normalMap = null
        m.needsUpdate = true
      }
    }
  }, [scene, materials, glass, plateTexture])

  // Paint, rims and interior: snap on first mount, tween on later changes.
  const first = useRef(true)
  useEffect(() => {
    const paint = materials['Paint 1 Carmine']
    const rim = materials.Rim2
    const trim = materials['Interior 3 Carmine']
    const rimFinish = RIM_FINISHES[wheelOption.id] ?? RIM_FINISHES['forged-01']
    const paintTarget = { color: bodyColor.hex, metalness: bodyColor.metalness, roughness: bodyColor.roughness }
    const trimTarget = { color: interiorColor.hex, metalness: 0, roughness: 0.45 }
    if (first.current) {
      first.current = false
      for (const [m, t] of [[paint, paintTarget], [rim, rimFinish], [trim, trimTarget]]) {
        if (!m) continue
        m.color.set(t.color)
        m.metalness = t.metalness
        m.roughness = t.roughness
      }
      return
    }
    if (paint) tweenMaterial(paint, paintTarget)
    if (rim) tweenMaterial(rim, rimFinish, 0.6)
    if (trim) tweenMaterial(trim, trimTarget, 0.8)
  }, [bodyColor, wheelOption, interiorColor, materials])

  useFrame(() => {
    if (materials.Headlight) materials.Headlight.emissiveIntensity = sceneState.headlight.intensity * HEADLIGHT_GAIN
    if (materials.Brakelight) materials.Brakelight.emissiveIntensity = sceneState.taillight.intensity * TAILLIGHT_GAIN
  })

  return <primitive object={scene} rotation={[0, Math.PI / 2, 0]} />
}

/** If the model can't be fetched or parsed, keep the experience alive with the procedural car. */
class VehicleBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.warn('[AUREX] Vehicle model failed to load; using procedural fallback.', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export default function Vehicle(props) {
  const fallback = <ProceduralVehicle {...props} />
  return (
    <VehicleBoundary fallback={fallback}>
      <Suspense fallback={null}>
        <GltfVehicle {...props} />
      </Suspense>
    </VehicleBoundary>
  )
}

useGLTF.preload(MODEL_URL, USE_DRACO, true)
