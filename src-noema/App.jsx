import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Field from './Field'
import { fieldState, STATES } from './fieldState'
import { FAQ, DEMO_LINES, USES } from './content'

gsap.registerPlugin(ScrollTrigger)

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e) => setMatches(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/** Each chapter hands the field to its own state as it scrolls into place. */
const CHAPTERS = [
  { id: 'thinking', morph: 1, offsetX: 1.55, offsetYMobile: 1.25 },
  { id: 'memory', morph: 2, offsetX: 1.6, offsetYMobile: 1.55 },
  { id: 'try', morph: 0, offsetX: 1.65, offsetYMobile: 1.5 },
  { id: 'uses', morph: 0, offsetX: 1.9, offsetYMobile: 1.3 },
]

export default function App() {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const isMobile = useMediaQuery('(max-width: 699px)')
  const rootRef = useRef(null)
  const [demoState, setDemoState] = useState('listening')

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      CHAPTERS.forEach((c) => {
        gsap.to(fieldState, {
          morph: c.morph,
          offsetX: c.offsetX,
          offsetYMobile: c.offsetYMobile,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: `#${c.id}`, start: 'top 85%', end: 'top 30%', scrub: true },
        })
      })
      // The demo controls only steer the field while their section is on screen.
      ScrollTrigger.create({
        trigger: '#try',
        start: 'top 60%',
        end: 'bottom 40%',
        onToggle: (self) => {
          if (!self.isActive) fieldState.override = null
        },
      })
    }, rootRef)
    return () => {
      ctx.revert()
      fieldState.override = null
    }
  }, [])

  const choose = (state) => {
    setDemoState(state.id)
    fieldState.override = state.morph
  }

  const line = DEMO_LINES[demoState]

  return (
    <div ref={rootRef}>
      <div className="field" aria-hidden="true">
        <Canvas
          dpr={[1, isMobile ? 1.5 : 1.75]}
          camera={{ position: [0, 0.15, 6.2], fov: 40, near: 0.1, far: 40 }}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#03060a']} />
          <Field count={isMobile ? 16000 : 42000} reducedMotion={reducedMotion} />
        </Canvas>
      </div>

      <header className="bar">
        <a className="wordmark" href="#top" aria-label="NOEMA, back to top">
          noema
        </a>
        <nav aria-label="Sections">
          <a href="#thinking">Thinking</a>
          <a href="#memory">Memory</a>
          <a href="#try">Try it</a>
          <a href="#faq">Questions</a>
        </nav>
        <a className="button button--small" href="#access">
          Request access
        </a>
      </header>

      <main id="top">
        <section className="chapter hero" aria-labelledby="hero-title">
          <h1 id="hero-title" className="display">Light that listens.</h1>
          <p className="lede">
            NOEMA is a voice interface for products that need to feel present. Instead of buttons and spinners, it
            shows what it’s doing as a living field of light.
          </p>
          <div className="actions">
            <a className="button" href="#access">
              Request early access
            </a>
            <a className="button button--quiet" href="#thinking">
              Watch it think
            </a>
          </div>
        </section>

        <section className="chapter" id="thinking" aria-labelledby="thinking-title">
          <h2 id="thinking-title" className="display display--2">Thinking, in plain sight.</h2>
          <p className="lede">
            When NOEMA works on an answer, the field opens into a slow spiral. Each arm is a line of reasoning it’s
            weighing, so people can see it’s busy before it says a word.
          </p>
        </section>

        <section className="chapter" id="memory" aria-labelledby="memory-title">
          <h2 id="memory-title" className="display display--2">Memory with a shape.</h2>
          <p className="lede">
            What NOEMA learns about someone gathers into a single form. They can open it, read what’s stored and
            delete anything with a tap.
          </p>
          <ul className="facts">
            <li>Memories stay on the device unless someone chooses to sync them.</li>
            <li>Every memory can be read in plain language and deleted.</li>
            <li>Nothing a person says is used to train a shared model.</li>
          </ul>
        </section>

        <section className="chapter" id="try" aria-labelledby="try-title">
          <h2 id="try-title" className="display display--2">Try the three states.</h2>
          <p className="lede">Pick one to see how NOEMA shows it.</p>
          <div className="console">
            <div className="segmented" role="radiogroup" aria-label="NOEMA state">
              {STATES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={demoState === s.id}
                  className="segmented__option"
                  onClick={() => choose(s)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="transcript" aria-live="polite">
              <p className="transcript__you">{line.you}</p>
              <p className="transcript__noema">{line.noema}</p>
            </div>
          </div>
        </section>

        <section className="chapter chapter--panel" id="uses" aria-labelledby="uses-title">
          <h2 id="uses-title" className="display display--3">Where it lives</h2>
          <div className="uses">
            {USES.map((u) => (
              <div key={u.title} className="use">
                <h3>{u.title}</h3>
                <p>{u.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="chapter chapter--panel" id="faq" aria-labelledby="faq-title">
          <h2 id="faq-title" className="display display--3">Questions</h2>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="chapter chapter--panel access" id="access" aria-labelledby="access-title">
          <h2 id="access-title" className="display display--2">Bring it into your product.</h2>
          <p className="lede">
            We’re opening NOEMA to a small group of teams building voice into cars, homes and devices.
          </p>
          <a className="button" href="mailto:hello@noema.example?subject=NOEMA%20early%20access">
            Email the team
          </a>
        </section>
      </main>

      <footer className="foot">
        <span>NOEMA is a design concept. The product, team and address are fictional.</span>
        <a href={import.meta.env.BASE_URL}>See the AUREX site</a>
      </footer>
    </div>
  )
}
