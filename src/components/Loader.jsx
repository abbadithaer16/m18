import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import gsap from 'gsap'
import './Loader.css'

/**
 * Full-screen cinematic loading sequence. Combines the real R3F loading
 * state (`useProgress`) with a deliberate minimum-duration count so the
 * reveal always feels intentional, even though the procedural scene has
 * almost nothing heavy to actually load.
 */
export default function Loader({ onFinish }) {
  const { active, progress } = useProgress()
  const [display, setDisplay] = useState(0)
  const [timerDone, setTimerDone] = useState(false)
  const rootRef = useRef(null)
  const finishedRef = useRef(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const counter = { v: 0 }
    const tl = gsap.timeline()
    tl.to(counter, {
      v: 100,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate: () => setDisplay(Math.round(counter.v)),
      onComplete: () => setTimerDone(true),
    })
    return () => tl.kill()
  }, [])

  useEffect(() => {
    if (!timerDone || active || finishedRef.current) return
    finishedRef.current = true
    document.body.style.overflow = ''
    gsap.to(rootRef.current, {
      autoAlpha: 0,
      duration: 1.1,
      ease: 'power2.inOut',
      delay: 0.2,
      onComplete: onFinish,
    })
  }, [timerDone, active, onFinish])

  const shown = Math.max(display, Math.round(progress))

  return (
    <div className="loader" ref={rootRef} aria-hidden={finishedRef.current}>
      <div className="loader-mark">AUREX</div>
      <div className="loader-status">
        <span>INITIALIZING</span>
        <span>AUREX ONE</span>
      </div>
      <div className="loader-progress">
        <div className="loader-bar">
          <div className="loader-bar-fill" style={{ transform: `scaleX(${shown / 100})` }} />
        </div>
        <span className="loader-progress-num">{String(shown).padStart(2, '0')}</span>
      </div>
    </div>
  )
}
