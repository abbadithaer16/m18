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
    Vehicle.jsx             AUREX ONE glTF model (public/models), wired
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

The AUREX ONE is rendered from `public/models/aurex-one.glb` (3.4 MB), adapted
from **[Car Concept](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept)**
by Eric Chadwick / Darmstadt Graphics Group, part of the Khronos glTF Sample
Assets, licensed **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**
(itself based on a CC0 model by "Unity Fan"). The licence requires the credit
shown in the site footer; keep it if you republish.

Changes made to the source asset (with gltf-transform, 11.8 MB → 3.4 MB):

- Khronos and 3D Commerce logos removed (licence-plate texture blanked, tyre
  sidewall colour and normal maps flattened where the logos were)
- `KHR_materials_variants`, transmission and iridescence dropped (the site
  uses its own tinted glass and configurator materials)
- Textures capped at 1024 px and re-encoded as WebP; geometry welded and
  meshopt-compressed (decoded by the bundled meshopt decoder, no CDN)

At runtime `src/three/Vehicle.jsx` rotates the model so its front faces +X,
swaps in the site's glass, renders an AUREX plate, and drives paint, rim
finish, interior trim and the head/tail lamps from the configurator and
scroll state. If the model fails to load, it falls back to the original
procedural car in `src/three/ProceduralVehicle.jsx`.

## Performance notes

- Adaptive DPR (`@react-three/drei`'s `AdaptiveDpr` + `PerformanceMonitor`)
- Shadows and reflective-floor blur are disabled on mobile
- The environment lighting is a procedurally baked probe (drei
  `Lightformer`s) rather than a fetched HDRI, so there's no runtime
  network dependency for the render to look correct
- `prefers-reduced-motion` disables the magnetic-button hover motion and
  all CSS keyframe/transition animation
