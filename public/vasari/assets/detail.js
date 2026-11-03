/* Film detail: a sheet of paper grows out of a cover rectangle (rotating from
   the cover's -4.5deg lean to straight) until it fills the screen; text lines
   rise out of masks and the poster bleeds in as ink blots. Shared by every
   page. No opacity fades. */

import { SHELF, svgCrop, reducedMotion } from './data.js'

const EASE = 'cubic-bezier(.2,.8,.2,1)'
const SHEET_EASE = 'cubic-bezier(.76,0,.18,1)'
const RM = reducedMotion()

const MARKUP = `
<div class="detail" id="detail" role="dialog" aria-modal="true" aria-labelledby="d-title">
  <button class="lbl box detail__close" type="button">Close / 閉じる</button>
  <div class="detail__band">
    <span class="logo">
      <span class="logo__cjk">莱昂·瓦萨里</span>
      <span class="logo__latin">LEON VASARI</span>
    </span>
  </div>
  <div class="detail__text">
    <span class="mask"><span class="lbl d-sub" id="d-sub"></span></span>
    <span class="mask"><h2 class="d-title" id="d-title"></h2></span>
    <span class="mask"><span class="lbl d-meta" id="d-meta"></span></span>
    <span class="mask"><p class="d-syn" id="d-syn"></p></span>
    <span class="mask"><p class="d-credit">Written and directed by Leon Vasari. 監督作品</p></span>
    <span class="mask"><button class="lbl d-watch" type="button" id="d-watch">Watch the film / 映画を見る</button></span>
    <span class="mask"><span class="lbl d-note" id="d-note" aria-live="polite"></span></span>
  </div>
  <div class="detail__poster">
    <svg viewBox="0 0 474 900" aria-hidden="true">
      <defs>
        <filter id="ink" filterUnits="userSpaceOnUse" x="-200" y="-200" width="874" height="1300">
          <feTurbulence type="fractalNoise" baseFrequency=".011" numOctaves="3" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="120" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <mask id="inkmask" maskUnits="userSpaceOnUse" x="-200" y="-200" width="874" height="1300">
          <g filter="url(#ink)" id="blobs">
            <circle cx="150" cy="330" r="0" fill="#fff" data-delay="0" />
            <circle cx="340" cy="600" r="0" fill="#fff" data-delay="120" />
            <circle cx="250" cy="120" r="0" fill="#fff" data-delay="220" />
            <circle cx="90" cy="760" r="0" fill="#fff" data-delay="300" />
            <circle cx="400" cy="250" r="0" fill="#fff" data-delay="360" />
            <circle cx="260" cy="860" r="0" fill="#fff" data-delay="420" />
            <circle cx="230" cy="470" r="0" fill="#fff" data-delay="180" />
          </g>
        </mask>
        <clipPath id="pclip"><rect width="474" height="900" /></clipPath>
      </defs>
      <g clip-path="url(#pclip)" mask="url(#inkmask)">
        <image id="d-image" preserveAspectRatio="none" />
      </g>
    </svg>
  </div>
</div>
`

function insetFor(r) {
  const top = Math.max(0, r.top)
  const left = Math.max(0, r.left)
  const right = Math.max(0, window.innerWidth - r.right)
  const bottom = Math.max(0, window.innerHeight - r.bottom)
  return `inset(${top}px ${right}px ${bottom}px ${left}px round 3px)`
}

/**
 * createDetail({ root, fallbackFocus, onOpen, onClose })
 *  root: element made inert while the sheet is open (the page behind it)
 *  open(filmId, getRect): getRect() returns the screen rect the sheet grows
 *    from and shrinks back into (called on open and again on close)
 */
export function createDetail({ root, fallbackFocus, onOpen, onClose } = {}) {
  let detail = document.getElementById('detail')
  if (!detail) {
    document.body.insertAdjacentHTML('beforeend', MARKUP)
    detail = document.getElementById('detail')
  }
  const $ = (sel) => detail.querySelector(sel)
  const dImage = $('#d-image')
  const blobs = [...detail.querySelectorAll('#blobs circle')]
  const textMasks = [...detail.querySelectorAll('.detail__text .mask > *')]
  let inkRaf = 0
  let lastFocus = null
  let rectFn = null
  let open = false

  function startInk() {
    cancelAnimationFrame(inkRaf)
    const t0 = performance.now() + (RM ? -5000 : 520)
    const step = (now) => {
      const t = now - t0
      blobs.forEach((b) => {
        const p = Math.min(1, Math.max(0, (t - Number(b.dataset.delay)) / 1250))
        b.setAttribute('r', (720 * (1 - (1 - p) ** 3)).toFixed(1))
      })
      if (t < 2400) inkRaf = requestAnimationFrame(step)
    }
    inkRaf = requestAnimationFrame(step)
  }

  function openDetail(filmId, getRect) {
    if (open) return
    const f = SHELF.find((x) => x.id === filmId)
    const book = f.kind === 'book'
    $('#d-sub').textContent = book ? `${f.author} / 本` : `${f.romaji} / ${f.kanji}`
    $('#d-title').textContent = f.title
    $('#d-meta').textContent = book ? `${f.year} / ${f.genre} / Book` : `${f.year} / ${f.genre} / ${f.min} min`
    $('#d-syn').textContent = f.synopsis
    $('#d-note').textContent = ''
    // Books are real (not Vasari films): credit the author, no "Watch the film".
    $('.d-credit').textContent = book
      ? `Written by ${f.author}. A real book, shelved beside Leon Vasari’s fictional films.`
      : 'Written and directed by Leon Vasari. 監督作品'
    $('#d-watch').parentElement.hidden = book
    // The poster takes the item's own cover proportions (474 wide in SVG units).
    const vh = Math.round(474 / f.aspect)
    detail.querySelector('.detail__poster').style.aspectRatio = `474 / ${vh}`
    detail.querySelector('.detail__poster svg').setAttribute('viewBox', `0 0 474 ${vh}`)
    detail.querySelector('#pclip rect').setAttribute('height', vh)
    const c = svgCrop(`cover-${f.id}`, 474, vh)
    dImage.setAttribute('href', c.href)
    dImage.setAttribute('x', c.x)
    dImage.setAttribute('y', c.y)
    dImage.setAttribute('width', c.width)
    dImage.setAttribute('height', c.height)
    blobs.forEach((b) => b.setAttribute('r', 0))

    rectFn = getRect
    const rect = getRect()
    open = true
    lastFocus = document.activeElement
    if (root) root.inert = true
    detail.getAnimations({ subtree: true }).forEach((a) => a.cancel())
    detail.classList.add('is-open')
    detail.scrollTop = 0
    detail.style.transformOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`
    detail.animate(
      [
        { clipPath: insetFor(rect), transform: 'rotate(-4.5deg)' },
        { clipPath: 'inset(0px 0px 0px 0px round 0px)', transform: 'rotate(0deg)' },
      ],
      { duration: RM ? 1 : 1050, easing: SHEET_EASE, fill: 'both' },
    )
    textMasks.forEach((el, i) =>
      el.animate([{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], {
        duration: RM ? 1 : 900,
        delay: RM ? 0 : 620 + i * 75,
        easing: EASE,
        fill: 'both',
      }),
    )
    startInk()
    $('.detail__close').focus({ preventScroll: true })
    onOpen?.(f)
  }

  function closeDetail() {
    if (!open) return
    const rect = rectFn()
    const anim = detail.animate(
      [
        { clipPath: 'inset(0px 0px 0px 0px round 0px)', transform: 'rotate(0deg)' },
        { clipPath: insetFor(rect), transform: 'rotate(-4.5deg)' },
      ],
      { duration: RM ? 1 : 850, easing: SHEET_EASE, fill: 'both' },
    )
    anim.onfinish = () => {
      detail.classList.remove('is-open')
      detail.getAnimations({ subtree: true }).forEach((a) => a.cancel())
      cancelAnimationFrame(inkRaf)
      open = false
      if (root) root.inert = false
      const back = lastFocus && lastFocus !== document.body && document.contains(lastFocus) ? lastFocus : fallbackFocus
      back?.focus({ preventScroll: true })
      onClose?.()
    }
  }

  $('.detail__close').addEventListener('click', closeDetail)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) closeDetail()
  })

  // Leon Vasari is fictional: say so instead of pretending to stream anything.
  $('#d-watch').addEventListener('click', () => {
    const note = $('#d-note')
    note.textContent = 'Leon Vasari and his films are fictional, so there is no film to watch. This site is a design study.'
    if (!RM) note.animate([{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], { duration: 650, easing: EASE })
  })

  return { open: openDetail, close: closeDetail, isOpen: () => open, el: detail }
}
