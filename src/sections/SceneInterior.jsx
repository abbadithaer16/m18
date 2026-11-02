import { useRef } from 'react'
import { useScrollScene } from '../hooks/useScrollScene'
import { INTERIOR_END } from '../three/cameraKeyframes'
import Headline from '../components/Headline'
import { SCENE_INTERIOR } from '../data/content'
import './SceneInterior.css'

export default function SceneInterior() {
  const sectionRef = useRef(null)
  const textRef = useRef(null)

  useScrollScene({
    sectionRef,
    camera: INTERIOR_END.camera,
    vehicle: INTERIOR_END.vehicle,
    light: INTERIOR_END.light,
    headlight: INTERIOR_END.headlight,
    taillight: INTERIOR_END.taillight,
    textRef,
    textReveal: 'viewport',
  })

  return (
    <section className="section scene-interior" id="scene-interior" ref={sectionRef}>
      <div className="scene-interior-text" ref={textRef}>
        <Headline lines={SCENE_INTERIOR.headlineLines} size="lg" />
        <ul className="scene-interior-details">
          {SCENE_INTERIOR.details.map((d) => (
            <li key={d} className="label-small">
              {d}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
