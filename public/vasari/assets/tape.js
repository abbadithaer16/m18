/* VHS tape cuboid shared by the inner pages: the same faces, crops, shading
   and pose formulas as the hero shelf (shelf.js), sized by a container's --H. */

import { applyCrop } from './data.js'

export const smooth = (x) => x * x * (3 - 2 * x)

/** Resolve --H for `container` and write --ws / --d onto it. */
export function sizeFor(container) {
  const probe = document.createElement('div')
  probe.style.cssText = 'position:absolute;visibility:hidden;height:var(--H);width:1px;left:0;top:0'
  container.appendChild(probe)
  const H = probe.getBoundingClientRect().height
  probe.remove()
  const ws = (H * 142) / 840
  const d = (H * 474) / 900
  const gap = H * 0.03
  container.style.setProperty('--ws', `${ws}px`)
  container.style.setProperty('--d', `${d}px`)
  return { H, ws, d, gap }
}

export function makeTape(filmId) {
  const el = document.createElement('div')
  el.className = 'tape'
  const sp = document.createElement('div')
  sp.className = 'face sp'
  applyCrop(sp, `spine-${filmId}`)
  const cv = document.createElement('div')
  cv.className = 'face cv'
  applyCrop(cv, `cover-${filmId}`)
  el.append(sp, cv)
  return { el, sp, cv, o: 0, lift: 0, tiltX: 0, tiltY: 0 }
}

/** Pose exactly like the hero: o = openness 0 (spine) … 1 (cover facing you). */
export function poseTape(t, H, x = 0) {
  const o = t.o
  const y = -o * 0.025 * H - t.lift * 0.045 * H
  const z = o * 0.2 * H
  t.el.style.transform =
    `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${-4.5 * o}deg) rotateX(${t.tiltX * o}deg) rotateY(${-90 * o + t.tiltY * o}deg)`
  t.sp.style.setProperty('--shade', (o * 0.55).toFixed(3))
  t.cv.style.setProperty('--shade', ((1 - o) * 0.5).toFixed(3))
}

/** The face a sheet should grow from: the cover once it is mostly turned out. */
export function faceRect(t) {
  return (t.o > 0.5 ? t.cv : t.sp).getBoundingClientRect()
}

/** Hero shelf spacing: F(r) slides neighbours aside around the open tape. */
export function shelfX(r, { ws, d, gap }) {
  const B = Math.abs(r) < 1 ? (r + Math.sin(Math.PI * r) / Math.PI) / 2 : Math.sign(r) * 0.5
  return r * (ws + gap) + (d - ws + 1.6 * gap) * B
}
