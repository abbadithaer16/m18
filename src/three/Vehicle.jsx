import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import ProceduralVehicle from './ProceduralVehicle'
import { sceneState } from '../state/sceneState'

/**
 * The car: a 1985 DeLorean DMC-12 Time Machine.
 *
 * Source: "1985 DeLorean DMC-12 Time Machine (BTTF)" by VTX on Sketchfab,
 * CC BY-NC-SA 4.0 — non-commercial use only; adaptations of the model must
 * carry the same licence. Credited in the footer and README.
 *
 * public/models/delorean-dmc12.glb was prepared with gltf-transform
 * (28 MB → 4.5 MB): transmission dropped, welded, simplified 461k → 238k
 * triangles (error-bounded), textures ≤1024 px WebP, meshopt geometry.
 *
 * Everything model-specific lives in MODEL so another car can be swapped in
 * by changing this block (plus the camera keyframes that frame it).
 */
const T = 'TimeBTTF_TimeMachine1_1985'
const MODEL = {
  url: `${import.meta.env.BASE_URL}models/delorean-dmc12.glb`,
  // Authored ~1.33× real size, front towards +Z. 0.75 restores the DMC-12's
  // 2.41 m wheelbase / 1.14 m height; the quarter turn points the front at
  // +X, which the scroll camera keyframes assume.
  scale: 0.75,
  rotationY: Math.PI / 2,
  materials: {
    paint: `${T}Paint_Material1`, // brushed stainless body panels (textured)
    rims: `${T}_Wheel1A_3D_3DWheel1A_Material1`,
    interior: `${T}InteriorA_Material1`,
    headlights: 'map2BTTF_TimeMachine1_1985LightEmissiveA_Material1',
    taillights: 'red_glas',
  },
}

// The configurator colour multiplies the stainless texture, so these finishes
// tint the brushed metal rather than repaint it flat.
const RIM_FINISHES = {
  'forged-01': { color: '#ffffff', metalness: 0.92, roughness: 0.32 },
  'forged-02': { color: '#9a9a9c', metalness: 0.95, roughness: 0.36 },
  'forged-03': { color: '#55565a', metalness: 0.95, roughness: 0.45 },
}

// Interior is one texture atlas (seats, dash, trim). A full multiply by a
// near-black swatch would erase it, so blend the swatch into white.
const INTERIOR_TINT_STRENGTH = 0.55
const WHITE = new THREE.Color('#ffffff')
const interiorTint = (hex) => '#' + WHITE.clone().lerp(new THREE.Color(hex), INTERIOR_TINT_STRENGTH).getHexString()

// Lamp emission relative to sceneState.{head,tail}light.intensity, which the
// scroll keyframes drive (≈0.1 idle, 2.4 in the headlight scene).
const HEADLIGHT_GAIN = 2.6
const TAILLIGHT_GAIN = 2.0

function tweenMaterial(material, { color, metalness, roughness }, duration = 1.15) {
  const target = new THREE.Color(color)
  gsap.to(material.color, { r: target.r, g: target.g, b: target.b, duration, ease: 'power2.inOut', overwrite: true })
  gsap.to(material, { metalness, roughness, duration, ease: 'power2.inOut', overwrite: true })
}

function GltfVehicle({ bodyColor, wheelOption, interiorColor }) {
  const { scene, materials } = useGLTF(MODEL.url, false, true)
  const mats = useMemo(
    () => Object.fromEntries(Object.entries(MODEL.materials).map(([role, name]) => [role, materials[name]])),
    [materials],
  )

  useLayoutEffect(() => {
    scene.traverse((obj) => {
      if (!obj.isMesh) return
      const transparent = obj.material?.transparent
      obj.castShadow = !transparent
      obj.receiveShadow = !transparent
    })
  }, [scene])

  const first = useRef(true)
  useEffect(() => {
    const paintTarget = { color: bodyColor.hex, metalness: bodyColor.metalness, roughness: bodyColor.roughness }
    const rimTarget = RIM_FINISHES[wheelOption.id] ?? RIM_FINISHES['forged-01']
    const interiorTarget = { color: interiorTint(interiorColor.hex), metalness: 0, roughness: 0.6 }
    const pairs = [[mats.paint, paintTarget, 1.15], [mats.rims, rimTarget, 0.6], [mats.interior, interiorTarget, 0.8]]
    for (const [m, t, d] of pairs) {
      if (!m) continue
      if (first.current) {
        m.color.set(t.color)
        m.metalness = t.metalness
        m.roughness = t.roughness
      } else {
        tweenMaterial(m, t, d)
      }
    }
    first.current = false
  }, [bodyColor, wheelOption, interiorColor, mats])

  useFrame(() => {
    if (mats.headlights) mats.headlights.emissiveIntensity = sceneState.headlight.intensity * HEADLIGHT_GAIN
    if (mats.taillights) mats.taillights.emissiveIntensity = sceneState.taillight.intensity * TAILLIGHT_GAIN
  })

  return <primitive object={scene} scale={MODEL.scale} rotation={[0, MODEL.rotationY, 0]} />
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
  return (
    <VehicleBoundary fallback={<ProceduralVehicle {...props} />}>
      <Suspense fallback={null}>
        <GltfVehicle {...props} />
      </Suspense>
    </VehicleBoundary>
  )
}

useGLTF.preload(MODEL.url, false, true)
