import { useRef } from 'react'
import { useScrollScene } from '../hooks/useScrollScene'
import { FINAL_END } from '../three/cameraKeyframes'
import Headline from '../components/Headline'
import MagneticButton from '../components/MagneticButton'
import { FINAL, PRICE_JOD } from '../data/content'
import './FinalCTA.css'

export default function FinalCTA() {
  const sectionRef = useRef(null)
  const textRef = useRef(null)

  useScrollScene({
    sectionRef,
    camera: FINAL_END.camera,
    vehicle: FINAL_END.vehicle,
    light: FINAL_END.light,
    headlight: FINAL_END.headlight,
    taillight: FINAL_END.taillight,
    // Last block on the page: once revealed it stays, never fades out.
    texts: [{ ref: textRef, reveal: 'viewport', fadeOut: false }],
  })

  return (
    <section className="section final" id="final" ref={sectionRef}>
      <div className="final-text" ref={textRef}>
        <Headline lines={FINAL.headlineLines} size="xl" />
        <div className="final-meta">
          <span className="final-model">{FINAL.model}</span>
          <span className="label-small">FROM {PRICE_JOD} JOD</span>
        </div>
        <MagneticButton className="btn btn-primary">{FINAL.cta}</MagneticButton>
      </div>
    </section>
  )
}
