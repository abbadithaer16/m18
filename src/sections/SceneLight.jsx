import { useRef } from 'react'
import { useScrollScene } from '../hooks/useScrollScene'
import { LIGHT_END, REAR_END } from '../three/cameraKeyframes'
import Headline from '../components/Headline'
import { SCENE_LIGHT } from '../data/content'
import './SceneLight.css'

// A near-black hold before anything else — the section opens dark and
// stays there while scroll carries the camera into position, so the
// headlight ignition (below) reads as a deliberate reveal rather than the
// tail of the previous scene's brightness just trailing off.
const BLACKOUT = { key: 0.1, rim: 0.15, fill: 0.04, env: 0.08, floor: 0.06, exposure: 0.32 }

export default function SceneLight() {
  const sectionRef = useRef(null)
  const textRef = useRef(null)

  useScrollScene({
    sectionRef,
    // Two beats in one continuous camera arc: front 3/4 for the headlight
    // signature (0 → 0.55), then swinging around to the rear 3/4 for the
    // taillight signature (0.55 → 1) — see REAR_END in cameraKeyframes.
    camera: [
      { at: 0, duration: 0.55, vars: LIGHT_END.camera },
      { at: 0.55, duration: 0.45, vars: REAR_END.camera },
    ],
    vehicle: [
      { at: 0, duration: 0.55, vars: LIGHT_END.vehicle },
      { at: 0.55, duration: 0.45, vars: REAR_END.vehicle },
    ],
    light: [
      { at: 0, duration: 0.22, vars: BLACKOUT },
      { at: 0.22, duration: 0.33, vars: LIGHT_END.light },
      { at: 0.55, duration: 0.45, vars: REAR_END.light },
    ],
    headlight: [
      { at: 0, duration: 0.14, vars: { intensity: 0.04 }, ease: 'power2.in' },
      { at: 0.14, duration: 0.26, vars: { intensity: 2.7 }, ease: 'power2.out' },
      { at: 0.4, duration: 0.15, vars: LIGHT_END.headlight, ease: 'power2.inOut' },
      { at: 0.55, duration: 0.45, vars: REAR_END.headlight },
    ],
    taillight: [
      { at: 0, duration: 0.55, vars: { intensity: 0.12 } },
      { at: 0.55, duration: 0.3, vars: { intensity: 2.1 }, ease: 'power2.out' },
      { at: 0.85, duration: 0.15, vars: REAR_END.taillight, ease: 'power2.inOut' },
    ],
    textRef,
    textFadeInEnd: 0.22,
    textFadeOutStart: 0.38,
    textFadeOutEnd: 0.5,
  })

  return (
    <section className="section scene-light" id="scene-light" ref={sectionRef}>
      <div className="scene-light-text" ref={textRef}>
        <Headline lines={SCENE_LIGHT.headlineLines} size="lg" />
      </div>
    </section>
  )
}
