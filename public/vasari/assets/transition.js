/* Page transitions and scroll reveals for the whole site, in the hero's
   language: leaving a page, a sheet of paper grows out of the clicked link
   (from the cover's -4.5deg lean to straight) and fills the screen; the next
   page lifts that sheet away with a clip. Text rises out of masks as it
   scrolls into view. No opacity fades. */

import { reducedMotion } from './data.js'

const RM = reducedMotion()
const SHEET_EASE = 'cubic-bezier(.76,0,.18,1)'
const EASE = 'cubic-bezier(.2,.8,.2,1)'
const KEY = 'vasari-sheet'

const store = {
  get() {
    try {
      return sessionStorage.getItem(KEY)
    } catch {
      return null
    }
  },
  set(v) {
    try {
      if (v) sessionStorage.setItem(KEY, v)
      else sessionStorage.removeItem(KEY)
    } catch {
      /* storage blocked: transitions still play, arrival is just a cut */
    }
  },
}

function makeSheet() {
  const sheet = document.createElement('div')
  sheet.className = 'pagesheet'
  document.body.appendChild(sheet)
  return sheet
}

// ---------- arrival: lift the sheet the previous page left behind ----------
function arrive() {
  const pending = store.get()
  store.set(null)
  if (!pending || RM) {
    document.documentElement.classList.remove('sheet-pending')
    return
  }
  // Put the real sheet down before removing the CSS stand-in, so there is no flash.
  const sheet = makeSheet()
  document.documentElement.classList.remove('sheet-pending')
  const anim = sheet.animate(
    [{ clipPath: 'inset(0px 0px 0px 0px)' }, { clipPath: 'inset(0px 0px 100% 0px)' }],
    { duration: 820, delay: 60, easing: SHEET_EASE, fill: 'both' },
  )
  anim.onfinish = () => sheet.remove()
}

// ---------- departure ----------
function leave(from, go) {
  if (RM) return go()
  const r = from.getBoundingClientRect()
  const sheet = makeSheet()
  sheet.style.transformOrigin = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`
  const inset = `inset(${Math.max(0, r.top)}px ${Math.max(0, innerWidth - r.right)}px ${Math.max(0, innerHeight - r.bottom)}px ${Math.max(0, r.left)}px round 3px)`
  const anim = sheet.animate(
    [
      { clipPath: inset, transform: 'rotate(-4.5deg)' },
      { clipPath: 'inset(0px 0px 0px 0px round 0px)', transform: 'rotate(0deg)' },
    ],
    { duration: 760, easing: SHEET_EASE, fill: 'both' },
  )
  anim.onfinish = () => {
    store.set('1')
    go()
  }
}

function isInternalPage(a) {
  if (!a || a.target === '_blank' || a.hasAttribute('download')) return false
  const url = new URL(a.href, location.href)
  if (url.origin !== location.origin) return false
  if (!url.pathname.includes('/vasari/')) return false
  const samePage = url.pathname === location.pathname || (url.pathname.endsWith('/') && location.pathname.endsWith('/index.html'))
  return !samePage
}

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const a = e.target.closest('a[href]')
  if (!a) return
  // "Back / 戻る": go back in history when the previous page is on this site.
  if (a.classList.contains('back') && document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) {
    e.preventDefault()
    e.stopImmediatePropagation()
    leave(a, () => history.back())
    return
  }
  if (!isInternalPage(a)) return
  e.preventDefault()
  leave(a, () => location.assign(a.href))
}, true)

// Coming back through the back/forward cache the departure sheet is still
// covering the restored page: lift it the same way a fresh arrival does, and
// clear the flag so the next page does not play a stale arrival.
window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return
  store.set(null)
  document.documentElement.classList.remove('sheet-pending')
  document.querySelectorAll('.pagesheet').forEach((sheet) => {
    sheet.getAnimations().forEach((a) => a.cancel())
    if (RM) return sheet.remove()
    sheet.style.transform = 'none'
    sheet.animate([{ clipPath: 'inset(0px 0px 0px 0px)' }, { clipPath: 'inset(0px 0px 100% 0px)' }], {
      duration: 820,
      easing: SHEET_EASE,
      fill: 'both',
    }).onfinish = () => sheet.remove()
  })
})

// ---------- scroll reveals ----------
// Each .reveal is an overflow mask; its children start pushed below it (CSS)
// and rise when the mask enters the viewport. Masks are observed, not the
// children: a fully clipped child never counts as intersecting.
export function revealOnScroll(root = document) {
  const masks = [...root.querySelectorAll('.reveal')]
  const rise = (mask, delay) =>
    [...mask.children].forEach((el) =>
      el.animate([{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], { duration: 900, delay, easing: EASE, fill: 'both' }),
    )
  if (RM || !('IntersectionObserver' in window)) {
    masks.forEach((m) => [...m.children].forEach((el) => (el.style.transform = 'none')))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries
        .filter((en) => en.isIntersecting)
        .forEach((en, i) => {
          io.unobserve(en.target)
          rise(en.target, i * 75)
        })
    },
    { rootMargin: '0px 0px -6% 0px' },
  )
  masks.forEach((m) => io.observe(m))
}

/** Re-run the rise on masks that are already visible (e.g. after filtering). */
export function riseNow(masks) {
  if (RM) return
  masks.forEach((m, i) =>
    [...m.children].forEach((el) =>
      el.animate([{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], { duration: 650, delay: i * 45, easing: EASE, fill: 'both' }),
    ),
  )
}

arrive()
