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
    Vehicle.jsx             Procedural AUREX ONE body (swap for a GLTF
                           loader with the same props later)
    Wheel.jsx               Wheel/rim/brake assembly, per-corner
    Cockpit.jsx             Stylized interior
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

No licensed GLB was sourced for this build, so the AUREX ONE is a
procedurally generated sports-coupe silhouette (extruded body profile +
wheel/rim assemblies + glass canopy + lighting details), built with a
believable long-hood / wide-stance proportion. `Vehicle.jsx` exposes the
same `{ bodyColor, wheelOption, interiorColor }` prop contract a future
GLTF-based component could use, so swapping in a licensed model later
shouldn't require touching the scroll/camera/lighting system.

## Performance notes

- Adaptive DPR (`@react-three/drei`'s `AdaptiveDpr` + `PerformanceMonitor`)
- Shadows and reflective-floor blur are disabled on mobile
- The environment lighting is a procedurally baked probe (drei
  `Lightformer`s) rather than a fetched HDRI, so there's no runtime
  network dependency for the render to look correct
- `prefers-reduced-motion` disables the magnetic-button hover motion and
  all CSS keyframe/transition animation
