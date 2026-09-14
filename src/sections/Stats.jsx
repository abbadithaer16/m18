import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScrollScene } from '../hooks/useScrollScene'
import { STATS_END } from '../three/cameraKeyframes'
import { STATS } from '../data/content'
import './Stats.css'

gsap.registerPlugin(ScrollTrigger)

const decimalsOf = (str) => (str.includes('.') ? str.split('.')[1].length : 0)

export default function Stats() {
  const sectionRef = useRef(null)
  const valueRefs = useRef([])

  useScrollScene({
    sectionRef,
    camera: STATS_END.camera,
    vehicle: STATS_END.vehicle,
    light: STATS_END.light,
    headlight: STATS_END.headlight,
    taillight: STATS_END.taillight,
  })

  useLayoutEffect(() => {
    const el = sectionRef.current
    if (!el) return undefined

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 72%',
        once: true,
        onEnter: () => {
          STATS.forEach((stat, i) => {
            const node = valueRefs.current[i]
            if (!node) return
            const target = parseFloat(stat.value)
            const dec = decimalsOf(stat.value)
            const proxy = { v: 0 }
            gsap.to(proxy, {
              v: target,
              duration: 1.7,
              delay: i * 0.08,
              ease: 'power2.out',
              onUpdate: () => {
                node.textContent = proxy.v.toFixed(dec)
              },
            })
          })
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="section stats" id="stats" ref={sectionRef}>
      <div className="stats-grid">
        {STATS.map((stat, i) => (
          <div className="stat" key={stat.label}>
            <div className="stat-value">
              <span ref={(node) => (valueRefs.current[i] = node)}>0</span>
              <span className="stat-unit">{stat.unit}</span>
            </div>
            <span className="label-small">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
