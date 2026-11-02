/* Inner pages (films, biography, retrospective), built from the hero's parts:
   3D tapes that turn out to their covers, the paper-sheet film detail, masked
   text rises, the sliding cobalt indicator and the ring cursor. */

import { FILMS, preloadSheets, reducedMotion } from './data.js'
import { setCursorState } from './common.js'
import { createDetail } from './detail.js'
import { makeTape, poseTape, sizeFor, faceRect, shelfX, smooth } from './tape.js'
import { revealOnScroll, riseNow } from './transition.js'

const EASE = 'cubic-bezier(.2,.8,.2,1)'
const RM = reducedMotion()
const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches
const byId = Object.fromEntries(FILMS.map((f) => [f.id, f]))
const decadeOf = (f) => Math.floor(f.year / 10) * 10
preloadSheets()

const page = document.getElementById('page')
const detail = createDetail({
  root: page,
  onOpen: () => document.body.classList.add('locked'),
  onClose: () => document.body.classList.remove('locked'),
})

let mx = -1e4
let my = -1e4
window.addEventListener('pointermove', (e) => {
  mx = e.clientX
  my = e.clientY
})

// ---------- masked caption swap (as under the hero shelf) ----------
function swapLine(mask, text, dir) {
  const span = document.createElement('span')
  span.textContent = text
  const olds = [...mask.children].filter((c) => !c.classList.contains('cap__sizer') && !c.dataset.leaving)
  mask.appendChild(span)
  if (RM || !olds.length) {
    olds.forEach((o) => o.remove())
    return
  }
  span.animate([{ transform: `translateY(${dir * 105}%)` }, { transform: 'translateY(0)' }], { duration: 650, easing: EASE, fill: 'both' })
  olds.forEach((o) => {
    o.dataset.leaving = '1'
    const from = getComputedStyle(o).transform
    o.getAnimations().forEach((a) => a.cancel())
    o.animate([{ transform: from === 'none' ? 'translateY(0)' : from }, { transform: `translateY(${-dir * 105}%)` }], { duration: 650, easing: EASE, fill: 'both' }).onfinish = () => o.remove()
  })
}

// ---------- rows with turning tapes (films, retrospective) ----------
const rows = []

function mountRows(list) {
  list.querySelectorAll('.row').forEach((row) => {
    const btn = row.querySelector('.row__btn')
    const slot = row.querySelector('.row__slot')
    const stage = slot.querySelector('.row__stage')
    const tape = makeTape(btn.dataset.id)
    stage.appendChild(tape.el)
    const r = { row, btn, slot, tape, hover: false, geo: null }
    const on = () => (r.hover = true)
    const off = () => (r.hover = false)
    btn.addEventListener('pointerenter', on)
    btn.addEventListener('pointerleave', off)
    btn.addEventListener('focus', on)
    btn.addEventListener('blur', off)
    btn.addEventListener('click', () => detail.open(btn.dataset.id, () => faceRect(tape)))
    rows.push(r)
  })
}

function measureRows() {
  rows.forEach((r) => (r.geo = sizeFor(r.slot)))
}

// ---------- biography: one small shelf per decade, scrubbed by scroll ----------
const minis = []

function mountMinis() {
  document.querySelectorAll('.mini[data-films]').forEach((mini) => {
    const ids = mini.dataset.films.split(' ')
    const stage = mini.querySelector('.mini__stage')
    const tapes = ids.map((id, k) => {
      const t = makeTape(id)
      t.k = k
      t.hover = false
      t.el.addEventListener('pointerenter', () => (t.hover = true))
      t.el.addEventListener('pointerleave', () => (t.hover = false))
      t.el.addEventListener('click', () => onMiniClick(m, t))
      stage.appendChild(t.el)
      return t
    })
    const m = {
      mini,
      ids,
      tapes,
      f: 0,
      active: -1,
      geo: null,
      title: mini.querySelector('.mini__title'),
      meta: mini.querySelector('.mini__meta'),
    }
    mini.querySelector('.mini__open')?.addEventListener('click', () => {
      if (m.active >= 0) detail.open(m.ids[m.active], () => faceRect(m.tapes[m.active]))
    })
    minis.push(m)
  })
}

// Focus f runs 0 … n-1 as the shelf rises through the viewport.
function miniTarget(m) {
  const n = m.ids.length
  if (n < 2) return 0
  const r = m.mini.getBoundingClientRect()
  const p = Math.min(1, Math.max(0, (innerHeight * 0.92 - r.top) / (innerHeight * 0.72)))
  return p * (n - 1)
}

function onMiniClick(m, t) {
  const r = t.k - m.f
  if (Math.abs(r) < 0.5) {
    detail.open(m.ids[t.k], () => faceRect(t))
    return
  }
  // Glide the shelf to this tape by scrolling to where the focus lands on it.
  const n = m.ids.length
  const rect = m.mini.getBoundingClientRect()
  const wantTop = innerHeight * 0.92 - (t.k / (n - 1)) * innerHeight * 0.72
  window.scrollBy({ top: rect.top - wantTop, behavior: RM ? 'auto' : 'smooth' })
}

function measureMinis() {
  minis.forEach((m) => (m.geo = sizeFor(m.mini)))
}

// ---------- one frame loop for every tape on the page ----------
let last = performance.now()
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  const k = RM ? 1 : 1 - Math.exp(-8 * dt)
  const kt = RM ? 1 : 1 - Math.exp(-7 * dt)
  let cursor = null
  const open = detail.isOpen()

  // Rows: hovered (or, on touch, the row at the centre of the screen) turns out.
  let centre = null
  if (!FINE) {
    let best = innerHeight * 0.28
    rows.forEach((r) => {
      if (r.row.hidden) return
      const b = r.slot.getBoundingClientRect()
      const dist = Math.abs(b.top + b.height / 2 - innerHeight * 0.5)
      if (dist < best) {
        best = dist
        centre = r
      }
    })
  }
  rows.forEach((r) => {
    if (r.row.hidden || !r.geo) return
    const t = r.tape
    const want = (FINE ? r.hover : r === centre) ? 1 : 0
    t.o += (want - t.o) * k
    if (Math.abs(want - t.o) < 1e-3) t.o = want
    const b = r.slot.getBoundingClientRect()
    const over = FINE && r.hover && !open
    const ty = over ? Math.max(-9, Math.min(9, ((mx - (b.left + b.width / 2)) / (0.55 * r.geo.d)) * 9)) : 0
    const tx = over ? Math.max(-6, Math.min(6, (-(my - (b.top + b.height / 2)) / (r.geo.H / 2)) * 6)) : 0
    t.tiltY += (ty - t.tiltY) * kt
    t.tiltX += (tx - t.tiltX) * kt
    poseTape(t, r.geo.H)
    if (over) cursor = 'open'
  })

  // Biography shelves.
  minis.forEach((m) => {
    if (!m.geo) return
    const target = miniTarget(m)
    m.f = RM ? target : m.f + (target - m.f) * (1 - Math.exp(-6 * dt))
    const n = m.ids.length
    const cx = -(shelfX(0 - m.f, m.geo) + shelfX(n - 1 - m.f, m.geo)) / 2
    m.tapes.forEach((t) => {
      const r = t.k - m.f
      t.o = smooth(Math.max(0, 1 - Math.abs(r)))
      const liftT = t.hover && Math.abs(r) > 0.5 && !open ? 1 : 0
      t.lift += (liftT - t.lift) * (RM ? 1 : 1 - Math.exp(-12 * dt))
      poseTape(t, m.geo.H, cx + shelfX(r, m.geo))
      t.el.style.zIndex = Math.round(100 - Math.abs(r) * 4)
      if (t.hover && !open) cursor = Math.abs(r) < 0.5 ? 'open' : 'spine'
    })
    const a = Math.round(m.f)
    if (a !== m.active) {
      const dir = m.active < 0 ? 0 : Math.sign(a - m.active)
      m.active = a
      const f = byId[m.ids[a]]
      swapLine(m.title, f.title, dir || 1)
      swapLine(m.meta, `${f.year} / ${f.genre} / ${f.romaji} / ${f.kanji}`, dir || 1)
    }
  })

  setCursorState(open ? null : cursor)
  requestAnimationFrame(frame)
}

// ---------- films index ----------
const index = document.getElementById('index')
if (index) {
  index.innerHTML = FILMS.map(
    (f) => `
    <li class="row" data-decade="${decadeOf(f)}">
      <button class="row__btn" type="button" data-id="${f.id}" aria-label="Open ${f.title}, ${f.year}">
        <span class="row__slot" aria-hidden="true"><span class="row__stage"></span></span>
        <span class="reveal row__lead"><span class="lbl row__year">${f.year}</span></span>
        <span class="row__text">
          <span class="reveal"><span class="row__title">${f.title}</span></span>
          <span class="reveal"><span class="lbl row__sub">${f.romaji} / ${f.kanji}</span></span>
        </span>
        <span class="reveal row__end"><span class="lbl row__meta">${f.genre} / ${f.min} min</span></span>
      </button>
    </li>`,
  ).join('')
  mountRows(index)

  const filters = [...document.querySelectorAll('.filters .tab')]
  const ind = document.querySelector('.filters__ind')
  const pressed = () => filters.find((b) => b.getAttribute('aria-pressed') === 'true')
  const place = (btn) => {
    ind.style.width = `${btn.offsetWidth}px`
    ind.style.transform = `translateX(${btn.offsetLeft}px)`
  }
  filters.forEach((btn) =>
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)))
      place(btn)
      const dec = btn.dataset.decade
      index.querySelectorAll('.row').forEach((row) => (row.hidden = dec !== 'all' && row.dataset.decade !== dec))
      const visible = [...index.querySelectorAll('.row:not([hidden])')]
      document.getElementById('count').textContent = `${visible.length} films`
      riseNow(visible.flatMap((row) => [...row.querySelectorAll('.reveal')]))
    }),
  )
  place(pressed())
  document.fonts?.ready.then(() => place(pressed()))
  window.addEventListener('resize', () => place(pressed()))
}

// ---------- retrospective programme ----------
const programme = document.getElementById('programme')
if (programme) {
  const P = [
    ['Week 1 / 4–7 Dec', [['Thu 4 Dec', '19:00', 'valley', 'Opening night'], ['Fri 5 Dec', '20:30', 'bluehour', ''], ['Sat 6 Dec', '15:00', 'river', ''], ['Sat 6 Dec', '19:30', 'summer', ''], ['Sun 7 Dec', '17:00', 'green', '']]],
    ['Week 2 / 11–14 Dec', [['Thu 11 Dec', '19:00', 'noon', 'Introduced by the editor'], ['Fri 12 Dec', '21:00', 'observer', 'Late show'], ['Sat 13 Dec', '18:00', 'birds', ''], ['Sun 14 Dec', '16:00', 'storm', '']]],
    ['Week 3 / 18–20 Dec', [['Thu 18 Dec', '19:00', 'tide', ''], ['Fri 19 Dec', '20:00', 'war', ''], ['Sat 20 Dec', '20:00', 'door', 'Closing night']]],
  ]
  programme.innerHTML = P.map(
    ([week, items]) => `
    <section class="week" aria-label="${week}">
      <h2 class="reveal week__head"><span class="lbl box">${week}</span></h2>
      <ol class="index">
        ${items
          .map(([day, time, id, note]) => {
            const f = byId[id]
            return `
        <li class="row">
          <button class="row__btn" type="button" data-id="${id}" aria-label="Open ${f.title}, screening ${day} at ${time}">
            <span class="row__slot" aria-hidden="true"><span class="row__stage"></span></span>
            <span class="reveal row__lead"><span class="lbl row__when">${day}<br>${time}</span></span>
            <span class="row__text">
              <span class="reveal"><span class="row__title">${f.title}</span></span>
              <span class="reveal"><span class="lbl row__sub">${f.year} / ${f.romaji} / ${f.kanji}</span></span>
            </span>
            <span class="reveal row__end">${note ? `<span class="lbl box row__tag">${note}</span>` : '<span></span>'}</span>
          </button>
        </li>`
          })
          .join('')}
      </ol>
    </section>`,
  ).join('')
  mountRows(programme)
}

mountMinis()
revealOnScroll()
const measure = () => {
  measureRows()
  measureMinis()
}
measure()
window.addEventListener('resize', measure)
document.fonts?.ready.then(measure)
requestAnimationFrame((now) => {
  last = now
  frame(now)
})
