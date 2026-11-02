import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Studio, { FOG_NEAR, FOG_FAR } from './Studio'
import Vehicle from './Vehicle'
import { sceneState, dragState, pointerState } from '../state/sceneState'
import { damp } from './maths'

const DRAG_DAMPING = 0.93
const PARALLAX_STRENGTH = 0.045

export default function Experience({ bodyColor, wheelOption, interiorColor, highQuality }) {
  const { camera, gl, size } = useThree()
  const vehicleRef = useRef(null)
  const lookTarget = useRef(new THREE.Vector3(0, 0.55, 0))
  const framedPosition = useRef(new THREE.Vector3())

  useEffect(() => {
    const onMove = (event) => {
      pointerState.x = (event.clientX / window.innerWidth) * 2 - 1
      pointerState.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame(({ scene }, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30)

    // Inertial decay once the user has released the drag.
    if (!dragState.active) {
      dragState.rotY += dragState.velocity
      dragState.velocity *= DRAG_DAMPING
      if (Math.abs(dragState.velocity) < 0.00005) dragState.velocity = 0
    }

    const { camera: camState, vehicle: vState } = sceneState

    if (vehicleRef.current) {
      const targetRotY = vState.rotY + dragState.rotY + pointerState.x * PARALLAX_STRENGTH
      vehicleRef.current.rotation.y = damp(vehicleRef.current.rotation.y, targetRotY, 5.5, dt)
      vehicleRef.current.position.y = damp(vehicleRef.current.position.y, vState.posY, 5, dt)
      vehicleRef.current.position.x = damp(vehicleRef.current.position.x, vState.posX, 5, dt)
      vehicleRef.current.rotation.x = damp(vehicleRef.current.rotation.x, pointerState.y * -0.012, 4, dt)
    }

    // On narrow / portrait viewports a landscape-tuned camera position crops
    // the car badly (a PerspectiveCamera's fov is vertical, so a tall/thin
    // frustum shows far less width). Pull the camera back from the look-at
    // point proportionally so the full car still fits horizontally.
    const aspect = size.width / size.height
    const portraitScale = aspect < 1.1 ? THREE.MathUtils.clamp(1.15 / aspect, 1, 2.4) : 1
    const frameScale = 1 + (portraitScale - 1) * (camState.portraitFit ?? 1)
    // The fog range (Studio: near 9, far 26) is tuned for the landscape
    // camera distances. Pulling the camera back by up to 2.4× on portrait
    // phones put the car ~22 units away — ~75% fogged to near-black. Scale
    // the fog with the same factor so the car's fog density matches desktop.
    if (scene.fog) {
      scene.fog.near = FOG_NEAR * frameScale
      scene.fog.far = FOG_FAR * frameScale
    }
    framedPosition.current.set(
      camState.lx + (camState.x - camState.lx) * frameScale,
      camState.ly + (camState.y - camState.ly) * frameScale,
      camState.lz + (camState.z - camState.lz) * frameScale,
    )

    camera.position.x = damp(camera.position.x, framedPosition.current.x, 3.2, dt)
    camera.position.y = damp(camera.position.y, framedPosition.current.y, 3.2, dt)
    camera.position.z = damp(camera.position.z, framedPosition.current.z, 3.2, dt)

    lookTarget.current.x = damp(lookTarget.current.x, camState.lx, 3.2, dt)
    lookTarget.current.y = damp(lookTarget.current.y, camState.ly, 3.2, dt)
    lookTarget.current.z = damp(lookTarget.current.z, camState.lz, 3.2, dt)
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
        <Vehicle bodyColor={bodyColor} wheelOption={wheelOption} interiorColor={interiorColor} />
      </group>
    </>
  )
}
