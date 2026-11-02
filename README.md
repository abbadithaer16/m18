# AUREX / ONE

A cinematic, scroll-driven interactive launch site for the fictional
ultra-premium performance brand **AUREX** and its car, the **AUREX ONE**.

Built with React + Vite, Three.js / React Three Fiber / Drei, and GSAP +
ScrollTrigger. The 3D vehicle is procedurally modeled (no external GLB —
see notes below) and stays visible and physically "connected" through a
continuous, scroll-scrubbed camera and lighting sequence: hero → body →
wheels → headlights → interior → performance stats → configurator →
final CTA.

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

## Second page: NOEMA concept (`/noema/`)

A separate, self-contained concept site for a fictional AI voice interface,
served at `/m18/noema/` (entry `noema/index.html`, code in `src-noema/`). A
GLSL particle field morphs between three states as you scroll (orb for
listening, spiral galaxy for thinking, brain for remembering), and the
"Try the three states" controls drive it directly. It shares dependencies
with AUREX but no application code. All copy and visuals are original.

## Project structure

```
src/
  data/content.js        All on-page copy + configurator option data
  state/                 Shared scene state + the React config context
    sceneState.js         Mutable, non-React state read every frame by
                           the R3F render loop (camera, vehicle, lights,
                           drag rotation, pointer parallax)
    ConfigContext.jsx      React context for the configurator's live
                           body color / wheel / interior selection
  hooks/
    useScrollScene.js      Ties a DOM section's own scroll range to
                           `sceneState` via a scrubbed GSAP timeline
    useDragRotate.js        Pointer drag-to-rotate with inertia
    useMediaQuery.js        Small responsive / reduced-motion helpers
  three/
    Vehicle.jsx             The car's glTF model (public/models), wired
                           to the configurator and scroll lighting
    ProceduralVehicle.jsx   Original procedural car, used as a fallback
                           if the model fails to load
    Wheel.jsx / Cockpit.jsx Parts of the procedural fallback
    Studio.jsx               Lighting rig, procedural environment probe,
                           reflective floor
    Experience.jsx           Scene root: camera damping, vehicle
                           rotation, pointer tracking
    SceneCanvas.jsx          <Canvas> host + performance/DPR settings
    palette.js / maths.js / cameraKeyframes.js
  components/              Reusable UI: Nav, Footer, Loader, Headline,
                           MagneticButton, Swatch
  sections/                One component per scroll scene (Hero,
                           SceneBody, SceneWheels, SceneLight,
                           SceneInterior, Stats, Configurator, FinalCTA)
```

## Notes on the vehicle model

The car is rendered from `public/models/delorean-dmc12.glb` (4.5 MB), adapted
from **[1985 DeLorean DMC-12 Time Machine (BTTF)](https://sketchfab.com/3d-models/1985-delorean-dmc-12-time-machine-bttf-6fdfe2e2adba4886b48cc523871e88be)**
by VTX, licensed **[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)**:

- **Attribution:** the credit in the site footer must stay.
- **NonCommercial:** this site may not be used commercially while it ships
  this model.
- **ShareAlike:** the adapted `.glb` is distributed under the same licence.

DeLorean and Back to the Future are trademarks of their respective owners;
this is a non-commercial fan/portfolio use.

Changes made to the source asset (with gltf-transform, 28 MB → 4.5 MB):
transmission dropped, geometry welded and simplified 461k → 238k triangles
(error-bounded), textures capped at 1024 px as WebP, meshopt compression
(decoded by the bundled meshopt decoder, no CDN).

At runtime `src/three/Vehicle.jsx` scales the model by 0.75 to real DMC-12
size and turns it so the front faces +X. All model-specific settings (file,
scale, which materials are paint, rims, interior and lamps) are in its
`MODEL` block. The configurator tints the brushed-stainless body, rims and
interior; the scroll state drives head- and tail-lamp emission. If the model
fails to load, the original procedural car (`ProceduralVehicle.jsx`) is
shown instead.

## Performance notes

- Adaptive DPR (`@react-three/drei`'s `AdaptiveDpr` + `PerformanceMonitor`)
- Shadows and reflective-floor blur are disabled on mobile
- The environment lighting is a procedurally baked probe (drei
  `Lightformer`s) rather than a fetched HDRI, so there's no runtime
  network dependency for the render to look correct
- `prefers-reduced-motion` disables the magnetic-button hover motion and
  all CSS keyframe/transition animation
