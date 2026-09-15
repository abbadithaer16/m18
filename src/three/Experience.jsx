import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Studio from './Studio'
import Vehicle from './Vehicle'
import { sceneState, dragState, pointerState } from '../state/sceneState'
import { damp, clamp, springStep } from './maths'
import { polarToCartesian } from './cameraRig'

// A heavy object doesn't keep spinning long after you let go of it: the
// coast bleeds off quickly and smoothly (still exponential, so it never
// reads as an abrupt stop) rather than drifting for seconds on momentum.
const DRAG_DAMPING = 0.82
const PARALLAX_STRENGTH = 0.045

// Secondary-motion spring tuning. Kept deliberately soft/damped (no visible
// overshoot) and low-amplitude — this should read as mass, not as an
// animation. All angles in radians, all offsets in scene units.
const ROLL_GAIN = 0.55
const ROLL_MAX = 0.028
const ROLL_STIFFNESS = 90
const ROLL_DAMPING = 16

const PITCH_MAX = 0.014
const PITCH_STIFFNESS = 70
const PITCH_DAMPING = 14
const PITCH_POINTER_GAIN = 0.011
const PITCH_CAMERA_GAIN = 0.4

const SQUAT_GAIN = 0.11
const SQUAT_MAX = 0.018
const SQUAT_STIFFNESS = 110
const SQUAT_DAMPING = 15

const SHIFT_STRENGTH = 0.02

export default function Experience({ bodyColor, wheelOption, interiorColor, highQuality }) {
  const { camera, gl, size } = useThree()
  const vehicleRef = useRef(null)
  const chassisRef = useRef(null)
  const lookTarget = useRef(new THREE.Vector3(0, 0.55, 0))
  const framedPosition = useRef(new THREE.Vector3())

  const prevYaw = useRef(sceneState.vehicle.rotY)
  const prevCamZ = useRef(camera.position.z)
  const roll = useRef({ value: 0, velocity: 0 })
  const pitch = useRef({ value: 0, velocity: 0 })
  const squat = useRef({ value: 0, velocity: 0 })

  useEffect(() => {
    const onMove = (event) => {
      pointerState.x = (event.clientX / window.innerWidth) * 2 - 1
      pointerState.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30)

    // Inertial decay once the user has released the drag.
    if (!dragState.active) {
      dragState.rotY += dragState.velocity
      dragState.velocity *= DRAG_DAMPING
      if (Math.abs(dragState.velocity) < 0.0003) dragState.velocity = 0
    }

    const { camera: camState, vehicle: vState } = sceneState

    if (vehicleRef.current) {
      const targetRotY = vState.rotY + dragState.rotY + pointerState.x * PARALLAX_STRENGTH
      vehicleRef.current.rotation.y = damp(vehicleRef.current.rotation.y, targetRotY, 5.5, dt)
      vehicleRef.current.position.y = damp(vehicleRef.current.position.y, vState.posY, 5, dt)
      vehicleRef.current.position.x = damp(vehicleRef.current.position.x, vState.posX, 5, dt)
    }

    // --- Secondary motion: the body responds to what the yaw/camera are
    // doing rather than animating on its own, so it reads as inertia rather
    // than a decorative idle loop.
    if (chassisRef.current && dt > 0) {
      const yaw = vehicleRef.current ? vehicleRef.current.rotation.y : prevYaw.current
      const angularVelocity = (yaw - prevYaw.current) / dt
      prevYaw.current = yaw

      const camVelZ = (camera.position.z - prevCamZ.current) / dt
      prevCamZ.current = camera.position.z

      const rollTarget = clamp(-angularVelocity * ROLL_GAIN, -ROLL_MAX, ROLL_MAX)
      ;[roll.current.value, roll.current.velocity] = springStep(
        roll.current.value,
        roll.current.velocity,
        rollTarget,
        ROLL_STIFFNESS,
        ROLL_DAMPING,
        dt,
      )

      const pitchTarget = clamp(
        pointerState.y * -PITCH_POINTER_GAIN + -camVelZ * PITCH_CAMERA_GAIN * 0.01,
        -PITCH_MAX,
        PITCH_MAX,
      )
      ;[pitch.current.value, pitch.current.velocity] = springStep(
        pitch.current.value,
        pitch.current.velocity,
        pitchTarget,
        PITCH_STIFFNESS,
        PITCH_DAMPING,
        dt,
      )

      // Squats very slightly under fast rotation — mass settling into the
      // spin — and rebounds as it slows. Driven by |angular velocity| so it
      // is only ever a reaction, never a spontaneous loop.
      const squatTarget = -clamp(Math.abs(angularVelocity) * SQUAT_GAIN, 0, SQUAT_MAX)
      ;[squat.current.value, squat.current.velocity] = springStep(
        squat.current.value,
        squat.current.velocity,
        squatTarget,
        SQUAT_STIFFNESS,
        SQUAT_DAMPING,
        dt,
      )

      chassisRef.current.rotation.z = roll.current.value
      chassisRef.current.rotation.x = pitch.current.value
      chassisRef.current.position.y = squat.current.value
      chassisRef.current.position.x = damp(
        chassisRef.current.position.x,
        pointerState.x * SHIFT_STRENGTH,
        4,
        dt,
      )
    }

    // camState.lx/lz are authored in the vehicle's own local frame (e.g. the
    // wheel macro's look-at sits at the front-left wheel's local position),
    // not world space — the vehicle itself is spinning underneath, so a raw
    // world-space anchor would drift away from the part it's supposed to be
    // tracking as soon as rotY moves off zero. Rotate the anchor by the
    // vehicle's actual current yaw so the camera keeps looking at the same
    // physical point on the car regardless of how it's currently oriented.
    const yaw = vehicleRef.current ? vehicleRef.current.rotation.y : 0
    const cosYaw = Math.cos(yaw)
    const sinYaw = Math.sin(yaw)
    const worldLx = camState.lx * cosYaw + camState.lz * sinYaw
    const worldLz = -camState.lx * sinYaw + camState.lz * cosYaw

    // On narrow / portrait viewports a landscape-tuned camera position crops
    // the car badly (a PerspectiveCamera's fov is vertical, so a tall/thin
    // frustum shows far less width). Pull the camera back from the look-at
    // point proportionally so the full car still fits horizontally — with a
    // polar rig this is just scaling the radius (and the height offset from
    // the look-at point) rather than an arbitrary vector lerp.
    const aspect = size.width / size.height
    const frameScale = aspect < 1.1 ? THREE.MathUtils.clamp(1.15 / aspect, 1, 2.7) : 1
    const scaledRadius = camState.radius * frameScale
    const scaledHeight = camState.ly + (camState.height - camState.ly) * frameScale
    const cart = polarToCartesian(camState.angle, scaledRadius, scaledHeight, worldLx, worldLz)
    framedPosition.current.set(cart.x, cart.y, cart.z)

    // Camera position trails slightly behind its look-at target — a heavier,
    // more deliberate signature than the vehicle's own damping — while the
    // target itself resolves a touch quicker so the frame stays composed.
    camera.position.x = damp(camera.position.x, framedPosition.current.x, 2.6, dt)
    camera.position.y = damp(camera.position.y, framedPosition.current.y, 2.6, dt)
    camera.position.z = damp(camera.position.z, framedPosition.current.z, 2.6, dt)

    lookTarget.current.x = damp(lookTarget.current.x, worldLx, 2.9, dt)
    lookTarget.current.y = damp(lookTarget.current.y, camState.ly, 2.9, dt)
    lookTarget.current.z = damp(lookTarget.current.z, worldLz, 2.9, dt)
    camera.lookAt(lookTarget.current)

    if (camera.isPerspectiveCamera) {
      const nextFov = damp(camera.fov, camState.fov, 3, dt)
      if (Math.abs(nextFov - camera.fov) > 0.001) {
        camera.fov = nextFov
        camera.updateProjectionMatrix()
      }
    }

    gl.toneMappingExposure = damp(gl.toneMappingExposure, sceneState.light.exposure, 3, dt)
  })

  return (
    <>
      <Studio highQuality={highQuality} />
      <group ref={vehicleRef} position={[0, 0, 0]}>
        <group ref={chassisRef}>
          <Vehicle bodyColor={bodyColor} wheelOption={wheelOption} interiorColor={interiorColor} />
        </group>
      </group>
    </>
  )
}
