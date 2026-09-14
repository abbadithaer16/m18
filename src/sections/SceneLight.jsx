import { useRef } from 'react'
import { useScrollScene } from '../hooks/useScrollScene'
import { LIGHT_END } from '../three/cameraKeyframes'
import Headline from '../components/Headline'
import { SCENE_LIGHT } from '../data/content'
import './SceneLight.css'

export default function SceneLight() {
  const sectionRef = useRef(null)
  const textRef = useRef(null)

  useScrollScene({
    sectionRef,
    camera: LIGHT_END.camera,
    vehicle: LIGHT_END.vehicle,
    light: LIGHT_END.light,
    headlight: LIGHT_END.headlight,
    taillight: LIGHT_END.taillight,
    textRef,
    textFadeInEnd: 0.3,
    textFadeOutStart: 0.55,
    textFadeOutEnd: 0.7,
  })

  return (
    <section className="section scene-light" id="scene-light" ref={sectionRef}>
      <div className="scene-light-text" ref={textRef}>
        <Headline lines={SCENE_LIGHT.headlineLines} size="lg" />
      </div>
    </section>
  )
}
