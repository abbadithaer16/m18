import { useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../hooks/useMediaQuery'

/**
 * Subtle magnetic hover: the button's contents drift a few pixels toward
 * the cursor, then spring back on leave. Restrained on purpose — this is
 * a refined micro-interaction, not a gimmick.
 */
export default function MagneticButton({ as = 'button', className = '', children, ...props }) {
  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const reducedMotion = useReducedMotion()

  const handleMove = (event) => {
    if (reducedMotion) return
    const el = outerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = event.clientX - (rect.left + rect.width / 2)
    const relY = event.clientY - (rect.top + rect.height / 2)
    gsap.to(innerRef.current, {
      x: relX * 0.22,
      y: relY * 0.35,
      duration: 0.5,
      ease: 'power2.out',
    })
    gsap.to(el, { x: relX * 0.08, duration: 0.5, ease: 'power2.out' })
  }

  const handleLeave = () => {
    // power3.out settles cleanly with no overshoot — an elastic ease reads
    // as a bounce, which is explicitly off the table for this brand.
    gsap.to(innerRef.current, { x: 0, y: 0, duration: 0.55, ease: 'power3.out' })
    gsap.to(outerRef.current, { x: 0, duration: 0.55, ease: 'power3.out' })
  }

  const Component = as

  return (
    <Component
      ref={outerRef}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      data-interactive
      {...props}
    >
      <span className="btn-inner" ref={innerRef}>
        {children}
      </span>
    </Component>
  )
}
