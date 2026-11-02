# CLAUDE.md

AUREX / ONE: a scroll-driven 3D launch site. See `README.md` for structure.

## Stack (check `package-lock.json` before trusting a skill's examples)

- Vite 8, React 19, **JavaScript/JSX** (no TypeScript sources or `tsconfig`; only `@types/react*` are installed).
- Three.js 0.186 through React Three Fiber 9 and Drei 10, using R3F's default **WebGL** renderer (`src/three/SceneCanvas.jsx`).
- GSAP 3.15 with ScrollTrigger and ScrollToPlugin, registered in `src/gsapSetup.js` (`lagSmoothing(0)` is deliberate). `@gsap/react` is **not** installed.
- Scrolling is native scroll plus ScrollTrigger. **Lenis is not installed** today.

## Project skills (`.claude/skills/`, sources in `SOURCES.md`)

Load only the skills that match the task in hand, not all of them every time.

| Task | Consult |
|---|---|
| Design-system recommendations: typography, palette, layout patterns, accessibility checks | `ui-ux-pro-max` (search with `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system`) |
| Visual composition and implementation, aesthetic direction | `frontend-design`, `emil-design-eng` |
| UI timing, easing, durations, building an animation | `animate` |
| Reviewing motion in a diff, or jank and dropped frames | `review-animations`, `animation-performance` |
| Touch, mobile feel, tap and press feedback | `mobile-native` |
| GSAP tweens, timelines, sequencing | `gsap-core`, `gsap-timeline`, `gsap-utils` |
| Scroll choreography, pinning, scrubbing | `gsap-scrolltrigger` (plus `gsap-plugins` for ScrollToPlugin and others) |
| GSAP inside React components, cleanup | `gsap-react`, `gsap-performance` |
| Shaders | `threejs-shaders` |
| Lighting, materials, textures | `threejs-lighting`, `threejs-materials`, `threejs-textures` |
| Post-processing | `threejs-postprocessing` |
| Loading and optimising models and textures | `threejs-loaders`, `threejs-asset-pipeline` |
| Frame rate, draw calls, memory | `threejs-performance` |
| R3F and Drei patterns | `threejs-react-three-fiber` |
| Browser verification (screenshots, console, interaction) | `webapp-testing` |

Division of labour: `ui-ux-pro-max` recommends (design system, type, palette, layout, accessibility); `frontend-design` composes and implements; the Emil, GSAP and Three.js skills own motion and 3D.

The UI UX Pro Max installer also added `design-system`, `brand`, `design`, `banner-design`, `slides` and `ui-styling`. Use them only when a task clearly calls for them. `ui-styling` targets shadcn/ui and Tailwind, which this project does not use. `design`'s logo, icon and CIP generators call the Gemini API; do not run them without the user's agreement.

### When skills disagree

Resolve conflicts against the user's visual references and this project's requirements, not against whichever skill spoke last. AUREX is an established dark, cinematic, editorial design (Big Shoulders Display and Archivo, near-black and warm white, a single red accent). Treat generated palettes, fonts and layout patterns as input to check, not instructions to apply; for example, a `--design-system` query for AUREX suggests a light background and Inter, both of which conflict with the current design. Accessibility findings (contrast, focus, reduced motion, touch targets) still apply.

## Constraints when applying a skill

- Keep the existing stack. Do not upgrade or add dependencies just to match a skill's examples. Check examples against the installed versions above.
- `gsap-react` assumes `useGSAP` from `@gsap/react`. This project scopes GSAP with `gsap.context()` inside `useLayoutEffect` and cleans up with `ctx.revert()` (`src/hooks/useScrollScene.js`). Follow that pattern unless adding `@gsap/react` is explicitly agreed.
- `threejs-shaders` covers TSL and node materials, which need the WebGPU renderer. This app uses the WebGL renderer, so use GLSL `ShaderMaterial` or `onBeforeCompile` unless a renderer change is agreed.
- Do not add a smooth-scroll engine as a side effect of following a skill. If Lenis is adopted later, it must be the only one, synced with ScrollTrigger.
- Respect `prefers-reduced-motion` (`useReducedMotion` in `src/hooks/useMediaQuery.js`, plus the global CSS rule), touch input, Safari, and the existing performance budgets (adaptive DPR, reduced effects on mobile).
- `webapp-testing` examples use Python Playwright, which is not installed by default. A Node Playwright script is fine instead.
- Installing a skill is not proof of visual quality. Verify changes in a real browser.
