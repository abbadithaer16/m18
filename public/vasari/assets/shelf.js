/* Leon Vasari — VHS filmography shelf.
   One requestAnimationFrame loop drives the shelf; the Web Animations API
   drives caption swaps, the paper sheet and text rises. No opacity fades. */

import { FILMS, applyCrop, preloadSheets, reducedMotion } from './data.js'
import { createDetail } from './detail.js'
import './transition.js'
import { setCursorState } from './common.js'

const N = FILMS.length // 12
const COPIES = 3
const TOTAL = N * COPIES // 36
const EASE = 'cubic-bezier(.2,.8,.2,1)'

const $ = (s, r = document) => r.querySelector(s)
const stage = $('#stage')
const shelf = $('.shelf')
const play = $('.play')
const page = $('#page')
const tabs = [...document.querySelectorAll('.tab')]
const ind = $('.tabs__ind')
const caps = {
  title: $('.cap--title'),
  sub: $('.cap--sub'),
  year: $('.cap--year'),
}
const announce = $('#announce')

const mod = (a, n) => ((a % n) + n) % n
const smooth = (x) => x * x * (3 - 2 * x)
const RM = reducedMotion()

preloadSheets()

// ---------- geometry ----------
let H = 0
let ws = 0
let d = 0
let gap = 0
let W = window.innerWidth
let VH = window.innerHeight

function measure() {
  const probe = document.createElement('div')
  probe.style.cssText = 'position:absolute;visibility:hidden;height:var(--H);width:1px;left:-9999px;top:0'
  document.body.appendChild(probe)
  H = probe.getBoundingClientRect().height
  probe.remove()
  ws = (H * 142) / 840
  d = (H * 474) / 900
  gap = H * 0.03
  W = window.innerWidth
  VH = window.innerHeight
  stage.style.setProperty('--ws', `${ws}px`)
  stage.style.setProperty('--d', `${d}px`)
  placeIndicator()
}

// ---------- tapes ----------
const tapes = []
for (let v = 0; v < TOTAL; v++) {
  const film = FILMS[v % N]
  const el = document.createElement('div')
  el.className = 'tape'
  el.dataset.v = v
  const sp = document.createElement('div')
  sp.className = 'face sp'
  applyCrop(sp, `spine-${film.id}`)
  const cv = document.createElement('div')
  cv.className = 'face cv'
  applyCrop(cv, `cover-${film.id}`)
  el.append(sp, cv)
  stage.appendChild(el)
  const t = { v, i: v % N, el, sp, cv, lift: 0, liftT: 0 }
  el.addEventListener('pointerenter', () => (hover = v))
  el.addEventListener('pointerleave', () => {
    if (hover === v) hover = -1
  })
  el.addEventListener('click', () => onTapeClick(t))
  tapes.push(t)
}

// ---------- state ----------
const fromHash = () => {
  const id = decodeURIComponent(location.hash.slice(1)).split('&')[0]
  const i = FILMS.findIndex((f) => f.id === id)
  return i < 0 ? 5 : i // opens on Noon in Ashes
}
// Read deep-link flags before the first frame rewrites the hash.
const wantOpen = /[#&]open\b/.test(location.hash)
let s = fromHash() + N
let T = s
let hover = -1
let active = -1
let mx = W / 2
let my = VH / 2
let tiltX = 0
let tiltY = 0
let onCover = false
let isOpen = false
let dragging = false
let suppressClick = false
let last = performance.now()

const relIndex = (v) => mod(v - s + TOTAL / 2, TOTAL) - TOTAL / 2
const B = (r) => (Math.abs(r) < 1 ? (r + Math.sin(Math.PI * r) / Math.PI) / 2 : Math.sign(r) * 0.5)
const F = (r) => r * (ws + gap) + (d - ws + 1.6 * gap) * B(r)

// ---------- caption ----------
function swapLine(mask, html, dir) {
  const span = document.createElement('span')
  span.innerHTML = html
  const olds = [...mask.children].filter((c) => !c.classList.contains('cap__sizer') && !c.dataset.leaving)
  mask.appendChild(span)
  if (RM || dir === 0) {
    olds.forEach((o) => o.remove())
    return
  }
  span.animate([{ transform: `translateY(${dir * 105}%)` }, { transform: 'translateY(0)' }], { duration: 650, easing: EASE, fill: 'both' })
  olds.forEach((o) => {
    o.dataset.leaving = '1'
    const from = getComputedStyle(o).transform
    o.getAnimations().forEach((a) => a.cancel())
    const a = o.animate([{ transform: from === 'none' ? 'translateY(0)' : from }, { transform: `translateY(${-dir * 105}%)` }], { duration: 650, easing: EASE, fill: 'both' })
    a.onfinish = () => o.remove()
  })
}

function setActive(i, dir) {
  active = i
  const f = FILMS[i]
  swapLine(caps.title, f.title, dir)
  swapLine(caps.sub, `${f.romaji} / ${f.kanji}`, dir)
  swapLine(caps.year, String(f.year), dir)
  announce.textContent = `${f.title}, ${f.year}`
  placeIndicator()
  if (history.replaceState) history.replaceState(null, '', `#${f.id}`)
}

// ---------- decade tabs ----------
function placeIndicator() {
  if (active < 0) return
  const dec = Math.floor(FILMS[active].year / 10) * 10
  const tab = tabs.find((t) => t.dataset.decade === String(dec))
  tabs.forEach((t) => t.classList.toggle('is-active', t === tab))
  if (!tab) return
  ind.style.width = `${tab.offsetWidth}px`
  ind.style.transform = `translateX(${tab.offsetLeft}px)`
}

tabs.forEach((tab) =>
  tab.addEventListener('click', () => {
    const dec = tab.dataset.decade
    const j = dec === 'all' ? 0 : FILMS.findIndex((f) => Math.floor(f.year / 10) * 10 === Number(dec))
    const cur = Math.round(T)
    let delta = mod(j - cur, N)
    if (delta > N / 2) delta -= N
    T = cur + delta
  }),
)

// ---------- inputs ----------
function onTapeClick(t) {
  if (suppressClick || isOpen) return
  const r = relIndex(t.v)
  if (Math.abs(r) < 0.5) openDetail()
  else T = Math.round(T + r)
}

$('.arrow--prev').addEventListener('click', () => (T = Math.round(T) - 1))
$('.arrow--next').addEventListener('click', () => (T = Math.round(T) + 1))
play.addEventListener('click', () => openDetail())

window.addEventListener('keydown', (e) => {
  if (isOpen) return
  if (e.key === 'ArrowLeft') T = Math.round(T) - 1
  else if (e.key === 'ArrowRight') T = Math.round(T) + 1
  else if (e.key === 'Enter' && (document.activeElement === document.body || !document.activeElement)) openDetail()
})

let wheelTimer = 0
window.addEventListener(
  'wheel',
  (e) => {
    if (isOpen) return
    e.preventDefault()
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    T += (delta / (ws + gap)) * 0.5
    clearTimeout(wheelTimer)
    wheelTimer = setTimeout(() => (T = Math.round(T)), 160)
  },
  { passive: false },
)

let downX = 0
let T0 = 0
let pressing = false
shelf.addEventListener('pointerdown', (e) => {
  if (isOpen) return
  pressing = true
  dragging = false
  suppressClick = false
  downX = e.clientX
  T0 = T
})
window.addEventListener('pointermove', (e) => {
  mx = e.clientX
  my = e.clientY
  if (!pressing) return
  const dx = e.clientX - downX
  if (!dragging && Math.abs(dx) > 5) dragging = true
  if (dragging) T = T0 - dx / (ws + gap)
})
window.addEventListener('pointerup', () => {
  if (!pressing) return
  pressing = false
  if (dragging) {
    T = Math.round(T)
    suppressClick = true
    setTimeout(() => (suppressClick = false), 0)
  }
  dragging = false
})
window.addEventListener('pointercancel', () => {
  pressing = false
  dragging = false
  T = Math.round(T)
})

// "Back" returns to the previous page on this site when there is one.
$('.back').addEventListener('click', (e) => {
  if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) {
    e.preventDefault()
    history.back()
  }
})

// ---------- frame loop ----------
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now

  // Spring towards the target.
  if (RM) s = T
  else {
    const k = dragging ? 18 : 5.2
    s += (T - s) * (1 - Math.exp(-k * dt))
    if (Math.abs(T - s) < 1e-4) s = T
  }
  const loops = TOTAL * 4
  if (Math.abs(s) > loops) {
    const shift = Math.sign(s) * TOTAL * Math.floor(Math.abs(s) / TOTAL)
    s -= shift
    T -= shift
  }

  const a = mod(Math.round(s), N)
  if (a !== active) setActive(a, Math.sign(T - s) || 1)

  // Tilt towards the cursor.
  const cy = VH / 2
  const settled = Math.abs(T - s) < 0.3
  onCover = !isOpen && settled && Math.abs(mx - W / 2) < 0.55 * d && Math.abs(my - cy) < 0.55 * H
  const ty = onCover ? ((mx - W / 2) / (0.55 * d)) * 9 : ((mx - W / 2) / W) * 5
  const tx = onCover ? (-(my - cy) / (H / 2)) * 6 : 0
  const kt = RM ? 1 : 1 - Math.exp(-7 * dt)
  tiltY += (ty - tiltY) * kt
  tiltX += (tx - tiltX) * kt

  const kl = RM ? 1 : 1 - Math.exp(-12 * dt)
  const limit = W / 2 + 1.5 * d
  for (const t of tapes) {
    const r = relIndex(t.v)
    const x = F(r)
    if (Math.abs(x) > limit) {
      if (t.el.style.visibility !== 'hidden') t.el.style.visibility = 'hidden'
      continue
    }
    if (t.el.style.visibility) t.el.style.visibility = ''
    t.liftT = hover === t.v && Math.abs(r) > 0.5 && !isOpen ? 1 : 0
    t.lift += (t.liftT - t.lift) * kl
    const o = smooth(Math.max(0, 1 - Math.abs(r)))
    const y = -o * 0.025 * H - t.lift * 0.045 * H
    const z = o * 0.2 * H
    t.el.style.transform =
      `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${-4.5 * o}deg) rotateX(${tiltX * o}deg) rotateY(${-90 * o + tiltY * o}deg)`
    t.el.style.zIndex = Math.round(100 - Math.abs(r) * 4)
    t.sp.style.setProperty('--shade', (o * 0.55).toFixed(3))
    t.cv.style.setProperty('--shade', ((1 - o) * 0.5).toFixed(3))
  }

  // Play ring: pops in once the shelf settles.
  const ps = isOpen ? 0 : smooth(Math.max(0, 1 - Math.abs(T - s) * 3))
  play.style.left = `${W / 2 - 0.5 * d - 6}px`
  play.style.top = `${cy + 0.36 * H}px`
  play.style.transform = `scale(${ps})`
  play.style.pointerEvents = ps > 0.5 ? 'auto' : 'none'

  // Cursor state.
  if (isOpen) setCursorState(null)
  else if (onCover) setCursorState('open')
  else if (hover >= 0 && Math.abs(relIndex(hover)) > 0.5) setCursorState('spine')
  else setCursorState(null)

  requestAnimationFrame(frame)
}

// ---------- detail: paper sheet + ink (shared module) ----------
function activeCoverRect() {
  const v = tapes.reduce((best, t) => (Math.abs(relIndex(t.v)) < Math.abs(relIndex(best.v)) ? t : best), tapes[0])
  return v.cv.getBoundingClientRect()
}

const detailSheet = createDetail({
  root: page,
  fallbackFocus: play,
  onClose: () => {
    isOpen = false
  },
})

function openDetail() {
  if (isOpen) return
  T = Math.round(T)
  s = T
  isOpen = true
  detailSheet.open(FILMS[mod(Math.round(T), N)].id, activeCoverRect)
}

// ---------- start ----------
measure()
window.addEventListener('resize', measure)
document.fonts?.ready.then(placeIndicator)
requestAnimationFrame((now) => {
  last = now
  frame(now)
  if (wantOpen) setTimeout(openDetail, 400)
})
