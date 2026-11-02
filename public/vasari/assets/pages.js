/* Inner pages: masked rise for the page head, films index (filters, spines,
   cursor-following cover), biography plates. */

import { FILMS, applyCrop, preloadSheets, reducedMotion } from './data.js'
import './common.js'

const EASE = 'cubic-bezier(.2,.8,.2,1)'
const RM = reducedMotion()
preloadSheets()

// Head lines rise out of their masks, one after another (no fades).
document.querySelectorAll('.rise > *').forEach((el, i) => {
  if (RM) return
  el.animate([{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], {
    duration: 900,
    delay: 120 + i * 75,
    easing: EASE,
    fill: 'both',
  })
})

// "Back" returns to the previous page on this site when there is one.
const back = document.querySelector('.back')
back?.addEventListener('click', (e) => {
  if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) {
    e.preventDefault()
    history.back()
  }
})

const byId = Object.fromEntries(FILMS.map((f) => [f.id, f]))

// ---------- films index ----------
const index = document.querySelector('#index')
if (index) {
  index.innerHTML = FILMS.map(
    (f, i) => `
    <li class="row" data-decade="${Math.floor(f.year / 10) * 10}">
      <a href="./#${f.id}&open" data-id="${f.id}">
        <span class="lbl row__idx">${String(i + 1).padStart(2, '0')}</span>
        <span class="row__spine" data-crop="spine-${f.id}" aria-hidden="true"></span>
        <span class="row__title">${f.title}</span>
        <span class="lbl row__sub">${f.romaji} / ${f.kanji}</span>
        <span class="lbl row__genre">${f.year} / ${f.genre}</span>
        <span class="lbl row__min">${f.min} min</span>
      </a>
    </li>`,
  ).join('')
  index.querySelectorAll('[data-crop]').forEach((el) => applyCrop(el, el.dataset.crop))

  // Decade filters with the sliding cobalt block.
  const filters = [...document.querySelectorAll('.filters .tab')]
  const ind = document.querySelector('.filters__ind')
  const place = (btn) => {
    ind.style.width = `${btn.offsetWidth}px`
    ind.style.transform = `translateX(${btn.offsetLeft}px)`
  }
  filters.forEach((btn) =>
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)))
      place(btn)
      const dec = btn.dataset.decade
      index.querySelectorAll('.row').forEach((row) => {
        row.hidden = dec !== 'all' && row.dataset.decade !== dec
      })
      document.querySelector('#count').textContent = `${index.querySelectorAll('.row:not([hidden])').length} films`
    }),
  )
  const start = filters.find((b) => b.getAttribute('aria-pressed') === 'true')
  place(start)
  document.fonts?.ready.then(() => place(filters.find((b) => b.getAttribute('aria-pressed') === 'true')))
  window.addEventListener('resize', () => place(filters.find((b) => b.getAttribute('aria-pressed') === 'true')))

  // Cover that follows the cursor, revealed by a clip (fine pointers only).
  const peek = document.querySelector('.peek')
  if (peek && window.matchMedia('(pointer: fine)').matches) {
    let tx = 0
    let ty = 0
    let px = 0
    let py = 0
    let lastT = performance.now()
    let current = ''
    index.addEventListener('pointerover', (e) => {
      const a = e.target.closest('a[data-id]')
      if (!a) return
      if (a.dataset.id !== current) {
        current = a.dataset.id
        applyCrop(peek, `cover-${current}`)
      }
      peek.classList.add('is-on')
    })
    index.addEventListener('pointerleave', () => {
      peek.classList.remove('is-on')
    })
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX
      ty = e.clientY
      if (!px) {
        px = tx
        py = ty
      }
    })
    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastT) / 1000)
      lastT = now
      const k = RM ? 1 : 1 - Math.exp(-10 * dt)
      px += (tx - px) * k
      py += (ty - py) * k
      peek.style.transform = `translate3d(${px + 150}px, ${py}px, 0) rotate(-4.5deg)`
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }
}

// ---------- biography plates ----------
document.querySelectorAll('.plates[data-films]').forEach((wrap) => {
  wrap.innerHTML = wrap.dataset.films
    .split(' ')
    .map((id) => {
      const f = byId[id]
      return `
      <a class="plate" href="./#${f.id}&open">
        <div class="plate__img" data-crop="cover-${f.id}" role="img" aria-label="Cover of ${f.title}"></div>
        <div class="plate__cap">
          <span class="plate__title">${f.title}</span>
          <span class="lbl" style="color:var(--muted)">${f.year} / ${f.genre}</span>
        </div>
      </a>`
    })
    .join('')
  wrap.querySelectorAll('[data-crop]').forEach((el) => applyCrop(el, el.dataset.crop))
})
