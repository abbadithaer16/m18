import { useRef } from 'react'
import { useScrollScene } from '../hooks/useScrollScene'
import { BODY_END } from '../three/cameraKeyframes'
import Headline from '../components/Headline'
import { SCENE_BODY } from '../data/content'
import './SceneBody.css'

export default function SceneBody() {
  const sectionRef = useRef(null)
  const textRef = useRef(null)

  useScrollScene({
    sectionRef,
    end: 'bottom top',
    camera: BODY_END.camera,
    vehicle: BODY_END.vehicle,
    light: BODY_END.light,
    headlight: BODY_END.headlight,
    taillight: BODY_END.taillight,
    textRef,
    textFadeInEnd: 0.22,
    textFadeOutStart: 0.45,
    textFadeOutEnd: 0.6,
  })

  return (
    <section className="section scene-body" id="scene-body" ref={sectionRef}>
      <div className="scene-body-text" ref={textRef}>
        <span className="label-small">{SCENE_BODY.label}</span>
        <Headline lines={SCENE_BODY.headlineLines} size="lg" />
      </div>
    </section>
  )
}
