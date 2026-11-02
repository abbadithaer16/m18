import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sceneState } from '../state/sceneState'

gsap.registerPlugin(ScrollTrigger)

const clamp01 = gsap.utils.clamp(0, 1)
const easeIn = gsap.parseEase('power2.out')
const easeOut = gsap.parseEase('power2.in')

/**
 * Viewport-position text reveal. Opacity is a pure function of where the
 * text block physically sits in the viewport, so copy is readable whenever
 * it is on screen — regardless of scroll speed, direction, or a direct jump
 * (nav link, anchor, reload mid-page).
 *
 * Earlier versions keyed the fade to the *section's* progress
 * (`top top` → `bottom top`). Text that sits low in a tall section is
 * physically on screen long before its section's top reaches the viewport
 * top, so it stayed invisible there, while the previous section's text had
 * already faded out — leaving ~0.5–1 viewport of blank scroll.
 *
 * Positions are measured with offsetTop/offsetHeight (layout values that
 * ignore the `y` transform applied here) relative to the section, which is
 * the ScrollTrigger, so the animated offset never feeds back into the
 * measurement.
 *
 * Bands (fractions of viewport height, measured from the top):
 *   fade in  while the text's top rises from `inFrom` to `inTo`
 *   fade out while the text's bottom rises from `outFrom` to `outTo`
 */
function createViewportReveal(textEl, sectionEl, cfg) {
  const { inFrom = 0.96, inTo = 0.68, outFrom = 0.28, outTo = 0.03, fadeOut = true } = cfg
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let lastScroll = null

  const render = (self, immediate) => {
    const vh = window.innerHeight
    const scroll = self.scroll()
    if (!immediate && scroll === lastScroll) return
    lastScroll = scroll
    // self.start is where the section's top meets the viewport bottom.
    const sectionTop = self.start + vh - scroll
    const top = sectionTop + textEl.offsetTop
    const bottom = top + textEl.offsetHeight
    const pIn = clamp01((vh * inFrom - top) / (vh * (inFrom - inTo)))
    const pOut = fadeOut ? clamp01((vh * outFrom - bottom) / (vh * (outFrom - outTo))) : 0
    const a = easeIn(pIn) * (1 - easeOut(pOut))
    const y = reduced ? 0 : 36 * (1 - easeIn(pIn)) - 22 * easeOut(pOut)
    // A short catch-up keeps the softness the old `scrub: 1` gave, while a
    // direct jump still lands on the correct state within ~0.3s.
    gsap.to(textEl, {
      autoAlpha: a,
      y,
      duration: immediate || reduced ? 0 : 0.3,
      ease: 'power1.out',
      overwrite: 'auto',
    })
  }

  gsap.set(textEl, { autoAlpha: 0, y: reduced ? 0 : 36 })
  ScrollTrigger.create({
    trigger: sectionEl,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => render(self, false),
    // Also covers leaving the range: onUpdate fires with the clamped state.
    onRefresh: (self) => render(self, true),
  })
}

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
 * Text reveals come in two modes. `textReveal: 'viewport'` (or
 * `reveal: 'viewport'` per entry in `texts`) ties opacity to where the text
 * physically sits on screen — see createViewportReveal — and is what the
 * story sections use. The default `'section'` mode below keys the fade to
 * section progress; the hero keeps it because its copy is visible on load.
 *
 * In 'section' mode, text fade-OUT must finish well before the section's own end: since
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
  taillight,
  textRef,
  textFadeInEnd = 0.3,
  textFadeOutStart = 0.5,
  textFadeOutEnd = 0.68,
  textInitiallyVisible = false,
  textReveal = 'section',
  texts,
  deps = [],
}) {
  useLayoutEffect(() => {
    const el = sectionRef.current
    if (!el) return undefined

    const textConfigs = (
      texts ?? (textRef ? [{ ref: textRef, textFadeInEnd, textFadeOutStart, textFadeOutEnd, textInitiallyVisible, reveal: textReveal }] : [])
    )

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start, end, scrub },
        defaults: { ease: 'none', duration: 1 },
      })

      if (camera) tl.to(sceneState.camera, { ...camera }, 0)
      if (vehicle) tl.to(sceneState.vehicle, { ...vehicle }, 0)
      if (light) tl.to(sceneState.light, { ...light }, 0)
      if (headlight) tl.to(sceneState.headlight, { ...headlight }, 0)
      if (taillight) tl.to(sceneState.taillight, { ...taillight }, 0)

      textConfigs.forEach((cfg) => {
        const textEl = cfg.ref?.current
        if (!textEl) return
        if (cfg.reveal === 'viewport') {
          createViewportReveal(textEl, el, cfg)
          return
        }
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
