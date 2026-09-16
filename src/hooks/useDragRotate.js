import { useEffect, useRef, useState } from 'react'
import { dragState, DRAG_COMFORT_LIMIT, DRAG_RESISTANCE_K } from '../state/sceneState'
import { rubberBandFalloff } from '../three/maths'

const ROTATE_SENSITIVITY = 0.0058
// Soft ceiling on per-sample rotation: fast flicks compress toward this
// instead of translating 1:1, so the car reads as having real rotational
// mass/resistance rather than snapping to whatever speed the cursor moved.
const MAX_DELTA = 0.04

/**
 * Binds pointer drag-to-rotate on the returned ref's element.
 * Writes directly into the shared `dragState` (no React re-render per move);
 * inertia decay happens once per frame in the R3F render loop (see
 * Experience.jsx) so it stays perfectly in sync with the rest of the scene.
 */
export function useDragRotate() {
  const zoneRef = useRef(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const pointer = useRef({ id: null, lastX: 0 })

  useEffect(() => {
    const el = zoneRef.current
    if (!el) return undefined

    const onPointerDown = (event) => {
      pointer.current.id = event.pointerId
      pointer.current.lastX = event.clientX
      dragState.active = true
      dragState.velocity = 0
      el.setPointerCapture?.(event.pointerId)
    }

    const onPointerMove = (event) => {
      if (pointer.current.id !== event.pointerId || !dragState.active) return
      const dx = event.clientX - pointer.current.lastX
      pointer.current.lastX = event.clientX
      const raw = dx * ROTATE_SENSITIVITY
      // tanh saturates smoothly rather than hard-clamping, so the resistance
      // itself feels continuous instead of introducing a velocity cliff.
      const saturated = Math.tanh(raw / MAX_DELTA) * MAX_DELTA
      const resistance = rubberBandFalloff(dragState.rotY, DRAG_COMFORT_LIMIT, DRAG_RESISTANCE_K)
      const delta = saturated * resistance
      dragState.rotY += delta
      dragState.velocity = delta
      setHasInteracted((prev) => (prev ? prev : true))
    }

    const endDrag = (event) => {
      if (pointer.current.id !== event.pointerId) return
      dragState.active = false
      pointer.current.id = null
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', endDrag)
    el.addEventListener('pointercancel', endDrag)
    el.addEventListener('pointerleave', endDrag)

    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', endDrag)
      el.removeEventListener('pointercancel', endDrag)
      el.removeEventListener('pointerleave', endDrag)
    }
  }, [])

  return { zoneRef, hasInteracted }
}
