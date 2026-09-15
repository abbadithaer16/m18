import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useScrollScene } from '../hooks/useScrollScene'
import { CONFIGURATOR_END } from '../three/cameraKeyframes'
import { useConfig } from '../state/ConfigContext'
import { dragState } from '../state/sceneState'
import Headline from '../components/Headline'
import MagneticButton from '../components/MagneticButton'
import Swatch from '../components/Swatch'
import { BODY_COLORS, WHEEL_OPTIONS, INTERIOR_COLORS, CONFIGURATOR, PRICE_JOD } from '../data/content'
import './Configurator.css'

const WHEEL_SWATCH_TONES = ['#c9cacc', '#9a9a9c', '#6f7073']

// Small drag-offset biases (added on top of CONFIGURATOR_END's own 3/4
// angle) so each category briefly turns the car toward its most flattering
// view — body color to the canonical 3/4, wheels toward the front corner,
// interior further round toward the cabin/glass — before handing control
// back to the user's own drag.
const CONFIG_BIAS = { body: 0, wheels: -0.34, interior: 0.55 }
const BIAS_DURATION = 0.9

export default function Configurator() {
  const sectionRef = useRef(null)
  const { bodyColor, wheel, interior, setBodyColorId, setWheelId, setInteriorId } = useConfig()
  const prevSelection = useRef({ body: bodyColor.id, wheel: wheel.id, interior: interior.id })

  useScrollScene({
    sectionRef,
    end: '+=650',
    camera: CONFIGURATOR_END.camera,
    vehicle: CONFIGURATOR_END.vehicle,
    light: CONFIGURATOR_END.light,
    headlight: CONFIGURATOR_END.headlight,
    taillight: CONFIGURATOR_END.taillight,
  })

  useEffect(() => {
    if (prevSelection.current.body === bodyColor.id) return
    prevSelection.current.body = bodyColor.id
    gsap.to(dragState, { rotY: CONFIG_BIAS.body, duration: BIAS_DURATION, ease: 'power2.inOut' })
  }, [bodyColor.id])

  useEffect(() => {
    if (prevSelection.current.wheel === wheel.id) return
    prevSelection.current.wheel = wheel.id
    gsap.to(dragState, { rotY: CONFIG_BIAS.wheels, duration: BIAS_DURATION, ease: 'power2.inOut' })
  }, [wheel.id])

  useEffect(() => {
    if (prevSelection.current.interior === interior.id) return
    prevSelection.current.interior = interior.id
    gsap.to(dragState, { rotY: CONFIG_BIAS.interior, duration: BIAS_DURATION, ease: 'power2.inOut' })
  }, [interior.id])

  const wheelIndex = WHEEL_OPTIONS.findIndex((w) => w.id === wheel.id)
  const forgedLabel = `FORGED ${String(wheelIndex + 1).padStart(2, '0')}`

  return (
    <section className="section configurator" id="configurator" ref={sectionRef}>
      <div className="configurator-heading">
        <Headline lines={CONFIGURATOR.headlineLines} size="lg" />
      </div>

      <div className="configurator-panel">
        <div className="config-group">
          <span className="label-small">Body Color</span>
          <div className="swatch-row">
            {BODY_COLORS.map((c) => (
              <Swatch
                key={c.id}
                color={c.hex}
                label={c.name}
                active={c.id === bodyColor.id}
                onClick={() => setBodyColorId(c.id)}
              />
            ))}
          </div>
        </div>

        <div className="config-group">
          <span className="label-small">Wheels</span>
          <div className="swatch-row">
            {WHEEL_OPTIONS.map((w, i) => (
              <Swatch
                key={w.id}
                color={WHEEL_SWATCH_TONES[i % WHEEL_SWATCH_TONES.length]}
                label={w.name}
                active={w.id === wheel.id}
                onClick={() => setWheelId(w.id)}
              />
            ))}
          </div>
        </div>

        <div className="config-group">
          <span className="label-small">Interior</span>
          <div className="swatch-row">
            {INTERIOR_COLORS.map((c) => (
              <Swatch
                key={c.id}
                color={c.hex}
                label={c.name}
                active={c.id === interior.id}
                onClick={() => setInteriorId(c.id)}
              />
            ))}
          </div>
        </div>

        <div className="hairline" />

        <div className="config-summary">
          <span className="config-summary-line">AUREX ONE</span>
          <span className="config-summary-line">{bodyColor.name.toUpperCase()}</span>
          <span className="config-summary-line">{forgedLabel}</span>
          <span className="config-summary-line">{interior.name} INTERIOR</span>
        </div>

        <div className="config-price">
          <span className="label-small">From</span>
          <span className="config-price-value">{PRICE_JOD} JOD</span>
        </div>

        <div className="btn-row config-ctas">
          <MagneticButton className="btn btn-primary">{CONFIGURATOR.ctaPrimary}</MagneticButton>
          <MagneticButton className="btn btn-secondary">{CONFIGURATOR.ctaSecondary}</MagneticButton>
        </div>
      </div>
    </section>
  )
}
