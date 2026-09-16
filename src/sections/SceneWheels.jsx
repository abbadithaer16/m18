import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScrollScene } from '../hooks/useScrollScene'
import { WHEELS_END } from '../three/cameraKeyframes'
import Headline from '../components/Headline'
import { SCENE_WHEELS } from '../data/content'
import './SceneWheels.css'

gsap.registerPlugin(ScrollTrigger)

export default function SceneWheels() {
  const sectionRef = useRef(null)
  const textRef = useRef(null)
  const calloutsRef = useRef(null)

  useScrollScene({
    sectionRef,
    // power2.out front-loads the push-in: the macro framing is substantially
    // reached by mid-section rather than only arriving in the last few
    // percent of scroll, so there's real time to sit in the close-up before
    // the callouts appear (a linear tween would spend most of the section
    // in a middling zoom and only pay off right at the very end).
    camera: [{ at: 0, duration: 1, vars: WHEELS_END.camera, ease: 'power2.out' }],
    vehicle: [{ at: 0, duration: 1, vars: WHEELS_END.vehicle, ease: 'power2.out' }],
    light: WHEELS_END.light,
    headlight: WHEELS_END.headlight,
    taillight: WHEELS_END.taillight,
    wheelSpin: WHEELS_END.wheelSpin,
    textRef,
    textFadeInEnd: 0.16,
    textFadeOutStart: 0.42,
    textFadeOutEnd: 0.58,
  })

  // Technical callouts wait until the wheel is actually framed (well past
  // the camera's macro push-in) before appearing, then reveal one at a
  // time rather than as a single block — a sequenced readout, not a caption.
  useLayoutEffect(() => {
    const el = sectionRef.current
    const callouts = calloutsRef.current?.querySelectorAll('.callout')
    if (!el || !callouts?.length) return undefined

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 1 },
      })
      gsap.set(callouts, { autoAlpha: 0, y: 20 })
      tl.to(
        callouts,
        { autoAlpha: 1, y: 0, stagger: 0.06, ease: 'power2.out', duration: 0.22 },
        0.45,
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

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
