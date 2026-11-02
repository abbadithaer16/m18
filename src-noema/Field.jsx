import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { buildField } from './shapes'
import { fieldState } from './fieldState'

const vertexShader = /* glsl */ `
  attribute vec3 aOrb;
  attribute vec3 aGalaxy;
  attribute vec3 aBrain;
  attribute float aSeed;
  attribute float aHue;

  uniform float uTime;
  uniform float uMorph;     // 0 orb, 1 galaxy, 2 brain (continuous)
  uniform float uIntro;     // 0 scattered, 1 assembled
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uMotion;    // 0 when the visitor prefers reduced motion
  uniform float uFade;      // dims the field while copy passes over it (phones)

  varying float vHue;
  varying float vAlpha;

  // Staggered blend: each point starts its move at a different moment.
  float stagger(float t) {
    return smoothstep(0.0, 1.0, clamp(t * 1.6 - aSeed * 0.6, 0.0, 1.0));
  }

  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

  void main() {
    float m1 = stagger(clamp(uMorph, 0.0, 1.0));
    float m2 = stagger(clamp(uMorph - 1.0, 0.0, 1.0));

    vec3 orb = aOrb * (1.0 + 0.035 * sin(uTime * 1.3 + aSeed * 0.6) * uMotion);
    vec3 galaxy = aGalaxy;
    galaxy.xz *= rot(uTime * 0.06 * uMotion); // spin within the disk's own plane
    galaxy.yz *= rot(0.42);                   // then a fixed tilt towards the viewer
    vec3 brain = aBrain;
    brain.xz *= rot(sin(uTime * 0.25) * 0.12 * uMotion);

    vec3 p = mix(orb, galaxy, m1);
    p = mix(p, brain, m2);

    // A little turbulence while points are in flight, none at rest.
    float flight = 4.0 * m1 * (1.0 - m1) + 4.0 * m2 * (1.0 - m2);
    p += flight * 0.18 * vec3(
      sin(aSeed * 40.0 + uTime * 0.9),
      cos(aSeed * 31.0 + uTime * 0.7),
      sin(aSeed * 23.0 - uTime * 0.8)
    );

    // Intro: points condense from a wide scatter.
    vec3 scatter = normalize(aOrb + 0.001) * (5.0 + aSeed * 6.0);
    p = mix(scatter, p, smoothstep(0.0, 1.0, clamp(uIntro * 1.4 - aSeed * 0.4, 0.0, 1.0)));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float twinkle = 0.75 + 0.25 * sin(uTime * (1.5 + aSeed * 2.0) + aSeed * 60.0) * uMotion + 0.25 * (1.0 - uMotion);
    gl_PointSize = uSize * uPixelRatio * (0.55 + aSeed * 0.9) / -mv.z;
    vHue = aHue;
    vAlpha = twinkle * uIntro * uFade;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uMint;
  uniform vec3 uViolet;
  varying float vHue;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = pow(smoothstep(0.5, 0.0, d), 1.6);
    vec3 color = mix(uMint, uViolet, vHue);
    color += vec3(0.35) * smoothstep(0.18, 0.0, d); // small hot core
    gl_FragColor = vec4(color * glow * vAlpha, 1.0);
  }
`

const damp = (a, b, lambda, dt) => THREE.MathUtils.lerp(a, b, 1 - Math.exp(-lambda * dt))

export default function Field({ count, reducedMotion }) {
  const pointsRef = useRef(null)
  const { gl, size } = useThree()
  const data = useMemo(() => buildField(count), [count])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    // `position` is required by three for bounds; the shader uses the shape attributes.
    g.setAttribute('position', new THREE.BufferAttribute(data.orb, 3))
    g.setAttribute('aOrb', new THREE.BufferAttribute(data.orb, 3))
    g.setAttribute('aGalaxy', new THREE.BufferAttribute(data.galaxy, 3))
    g.setAttribute('aBrain', new THREE.BufferAttribute(data.brain, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(data.seed, 1))
    g.setAttribute('aHue', new THREE.BufferAttribute(data.hue, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6)
    return g
  }, [data])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uMorph: { value: 0 },
          uIntro: { value: reducedMotion ? 1 : 0 },
          uSize: { value: 22 },
          uPixelRatio: { value: 1 },
          uMotion: { value: reducedMotion ? 0 : 1 },
          uFade: { value: 1 },
          uMint: { value: new THREE.Color('#7ef2d2') },
          uViolet: { value: new THREE.Color('#9d8cff') },
        },
      }),
    // reducedMotion is applied live below; build once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20)
    const u = material.uniforms
    u.uTime.value += dt * (reducedMotion ? 0 : 1)
    u.uMotion.value = reducedMotion ? 0 : 1
    u.uPixelRatio.value = gl.getPixelRatio()
    // Narrow screens see the field smaller; keep points proportionate.
    u.uSize.value = size.width < 700 ? 15 : 22
    u.uIntro.value = reducedMotion ? 1 : damp(u.uIntro.value, 1, 1.1, dt)

    const target = fieldState.override ?? fieldState.morph
    u.uMorph.value = reducedMotion ? target : damp(u.uMorph.value, target, 2.6, dt)

    // Copy overlapping the field's zone dims it, so text stays readable.
    const fade = 1 - 0.82 * fieldState.dim
    u.uFade.value = reducedMotion ? fade : damp(u.uFade.value, fade, 10, dt)

    const pts = pointsRef.current
    if (pts) {
      const mobile = size.width < 700
      const x = mobile ? 0 : fieldState.offsetX
      const y = mobile ? fieldState.offsetYMobile : 0
      const s = mobile ? 0.52 : 0.92
      if (reducedMotion) {
        // Snap: even sub-pixel easing reads as motion in a dense point field.
        pts.position.set(x, y, 0)
        pts.scale.setScalar(s)
      } else {
        pts.position.x = damp(pts.position.x, x, 3, dt)
        pts.position.y = damp(pts.position.y, y, 3, dt)
        pts.scale.setScalar(damp(pts.scale.x, s, 3, dt))
      }
    }
  })

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />
}
