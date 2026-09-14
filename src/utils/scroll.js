import gsap from 'gsap'

export function scrollToHash(hash) {
  const el = document.querySelector(hash)
  if (!el) return
  gsap.to(window, {
    duration: 1.3,
    ease: 'power2.inOut',
    scrollTo: { y: el, offsetY: 0 },
  })
}
