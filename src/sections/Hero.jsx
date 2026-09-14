import { useRef } from 'react'
import { useScrollScene } from '../hooks/useScrollScene'
import { useDragRotate } from '../hooks/useDragRotate'
import { HERO_END } from '../three/cameraKeyframes'
import Headline from '../components/Headline'
import MagneticButton from '../components/MagneticButton'
import { HERO } from '../data/content'
import { scrollToHash } from '../utils/scroll'
import './Hero.css'

export default function Hero() {
  const sectionRef = useRef(null)
  const textRef = useRef(null)
  const { zoneRef, hasInteracted } = useDragRotate()

  useScrollScene({
    sectionRef,
    camera: HERO_END.camera,
    vehicle: HERO_END.vehicle,
    light: HERO_END.light,
    headlight: HERO_END.headlight,
    taillight: HERO_END.taillight,
    textRef,
    textInitiallyVisible: true,
    textFadeOutStart: 0.22,
    textFadeOutEnd: 0.5,
  })

  return (
    <section className="section hero" id="hero" ref={sectionRef}>
      <div className="hero-drag-zone" ref={zoneRef} data-interactive />

      <div className="hero-text" ref={textRef}>
        <div className="hero-top">
          <span className="eyebrow">{HERO.eyebrow}</span>
          <Headline lines={HERO.headlineLines} size="xl" as="h1" />
        </div>

        <div className="hero-bottom">
          <p className="body-copy">{HERO.body}</p>
          <div className="btn-row">
            <MagneticButton className="btn btn-primary" onClick={() => scrollToHash('#scene-body')}>
              {HERO.ctaPrimary}
            </MagneticButton>
            <MagneticButton className="btn btn-secondary" onClick={() => scrollToHash('#configurator')}>
              {HERO.ctaSecondary}
            </MagneticButton>
          </div>
        </div>
      </div>

      <div className={`drag-hint ${hasInteracted ? 'is-hidden' : ''}`} aria-hidden={hasInteracted}>
        <span className="drag-hint-deg">{HERO.dragLabel}</span>
        <span className="drag-hint-label">{HERO.dragHint}</span>
      </div>
    </section>
  )
}
