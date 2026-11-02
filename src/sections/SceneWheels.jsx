import { useRef } from 'react'
import { useScrollScene } from '../hooks/useScrollScene'
import { WHEELS_END } from '../three/cameraKeyframes'
import Headline from '../components/Headline'
import { SCENE_WHEELS } from '../data/content'
import './SceneWheels.css'

export default function SceneWheels() {
  const sectionRef = useRef(null)
  const textRef = useRef(null)
  const calloutsRef = useRef(null)

  useScrollScene({
    sectionRef,
    camera: WHEELS_END.camera,
    vehicle: WHEELS_END.vehicle,
    light: WHEELS_END.light,
    headlight: WHEELS_END.headlight,
    taillight: WHEELS_END.taillight,
    texts: [
      { ref: textRef, reveal: 'viewport' },
      { ref: calloutsRef, reveal: 'viewport' },
    ],
  })

  return (
    <section className="section scene-wheels" id="scene-wheels" ref={sectionRef}>
      <div className="scene-wheels-text" ref={textRef}>
        <Headline lines={SCENE_WHEELS.headlineLines} size="lg" />
      </div>

      <div className="scene-wheels-callouts" ref={calloutsRef}>
        {SCENE_WHEELS.callouts.map((c) => (
          <div className="callout" key={c.label}>
            <span className="callout-value">{c.value}</span>
            <span className="label-small">{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
