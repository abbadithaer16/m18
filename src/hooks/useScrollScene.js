import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sceneState, sweepState } from '../state/sceneState'

gsap.registerPlugin(ScrollTrigger)

/**
 * Ties one DOM section's own scroll range to the shared `sceneState` object
 * (camera / vehicle / lighting) plus optional text reveals — all driven
 * continuously by scroll position via a single scrubbed GSAP timeline, so
 * the vehicle stays physically connected to the story instead of firing
 * independent enter/exit animations.
 *
 * Because the 3D canvas is visually fixed behind the page, sections don't
 * need to be pinned: each section's natural height *is* its slice of the
 * cinematic timeline.
 *
 * Text fade-OUT must finish well before the section's own end: since
 * sections aren't dramatically taller than the viewport, the next
 * section's content starts entering view before scroll progress hits
 * 1 — an exit fade that runs all the way to 1 will visibly overlap the
 * next section's text. Pass `textFadeOutEnd` well under 1 (each section
 * picks a value based on its own height) to keep the two apart.
 */
export function useScrollScene({
  sectionRef,
  start = 'top top',
  end = 'bottom top',
  scrub = 1,
  camera,
  vehicle,
  light,
  headlight,
  headlightWake,
  taillight,
  sweep,
  textRef,
  textFadeInEnd = 0.3,
  textFadeOutStart = 0.5,
  textFadeOutEnd = 0.68,
  textInitiallyVisible = false,
  texts,
  deps = [],
}) {
  useLayoutEffect(() => {
    const el = sectionRef.current
    if (!el) return undefined

    const textConfigs = (
      texts ?? (textRef ? [{ ref: textRef, textFadeInEnd, textFadeOutStart, textFadeOutEnd, textInitiallyVisible }] : [])
    )

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start, end, scrub },
        defaults: { ease: 'none', duration: 1 },
      })

      if (camera) tl.to(sceneState.camera, { ...camera }, 0)
      if (vehicle) tl.to(sceneState.vehicle, { ...vehicle }, 0)
      if (light) tl.to(sceneState.light, { ...light }, 0)
      if (sweep) tl.to(sweepState, { ...sweep }, 0)

      // A "wake" bump overshoots the final intensity mid-section then settles
      // back down — reads as the headlights actively switching on rather than
      // the value merely drifting to its target alongside everything else.
      if (headlightWake) {
        const { at = 0.55, peak, settleDuration = 0.25, ease = 'power2.out' } = headlightWake
        tl.to(sceneState.headlight, { intensity: peak, duration: Math.max(at, 0.001), ease }, 0)
        tl.to(
          sceneState.headlight,
          { ...headlight, duration: Math.max(settleDuration, 0.001), ease: 'power2.inOut' },
          at,
        )
      } else if (headlight) {
        tl.to(sceneState.headlight, { ...headlight }, 0)
      }

      if (taillight) tl.to(sceneState.taillight, { ...taillight }, 0)

      textConfigs.forEach((cfg) => {
        const textEl = cfg.ref?.current
        if (!textEl) return
        const fadeInEnd = cfg.textFadeInEnd ?? textFadeInEnd
        const fadeOutStart = cfg.textFadeOutStart ?? textFadeOutStart
        const fadeOutEnd = cfg.textFadeOutEnd ?? textFadeOutEnd
        const initiallyVisible = cfg.textInitiallyVisible ?? textInitiallyVisible

        if (initiallyVisible) {
          gsap.set(textEl, { autoAlpha: 1, y: 0 })
        } else {
          gsap.set(textEl, { autoAlpha: 0, y: 36 })
          tl.to(textEl, { autoAlpha: 1, y: 0, ease: 'power2.out', duration: Math.max(fadeInEnd, 0.001) }, 0)
        }
        if (fadeOutEnd < 1 || fadeOutStart < 1) {
          tl.to(
            textEl,
            {
              autoAlpha: 0,
              y: -22,
              ease: 'power2.in',
              duration: Math.max(fadeOutEnd - fadeOutStart, 0.001),
            },
            fadeOutStart,
          )
        }
      })
    }, sectionRef)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
