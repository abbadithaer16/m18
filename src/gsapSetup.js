import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

// Scroll-scrubbed timelines should track scroll position exactly, not
// smooth over main-thread stalls with a time "catch-up" — that fights
// the user's own scroll input. Disable GSAP's default lag smoothing.
gsap.ticker.lagSmoothing(0)
