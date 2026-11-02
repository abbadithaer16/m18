/* Shared behaviour: the ring cursor (fine pointers only). Pages can override
   its state through setCursorState(); otherwise links and buttons shrink it. */

const cursor = document.querySelector('.cursor')
let mx = -100
let my = -100
let cx = -100
let cy = -100
let forced = null
let last = performance.now()

export function setCursorState(state) {
  forced = state
}

export function pointer() {
  return { mx, my }
}

if (cursor) {
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return
    mx = e.clientX
    my = e.clientY
    if (cx < -50) {
      cx = mx
      cy = my
    }
  })

  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    const k = 1 - Math.exp(-16 * dt)
    cx += (mx - cx) * k
    cy += (my - cy) * k
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`

    let state = forced
    if (state == null) {
      const el = document.elementFromPoint(mx, my)
      state = el && el.closest('a, button, summary') ? 'btn' : ''
    }
    cursor.classList.toggle('spine', state === 'spine')
    cursor.classList.toggle('btn', state === 'btn')
    cursor.classList.toggle('open', state === 'open')
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
