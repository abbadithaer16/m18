import { useState } from 'react'
import { NAV_LINKS } from '../data/content'
import { scrollToHash } from '../utils/scroll'
import './Nav.css'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(false)

  const handleNavClick = (event, href) => {
    event.preventDefault()
    setMenuOpen(false)
    scrollToHash(href)
  }

  return (
    <>
      <header className="nav">
        <a
          className="nav-mark"
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          data-interactive
        >
          AUREX
        </a>

        <nav className="nav-links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} onClick={(e) => handleNavClick(e, link.href)} data-interactive>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-right">
          <button
            type="button"
            className="nav-utility"
            aria-pressed={soundOn}
            onClick={() => setSoundOn((s) => !s)}
            data-interactive
          >
            SOUND {soundOn ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            className="nav-utility nav-menu-btn"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((m) => !m)}
            data-interactive
          >
            {menuOpen ? 'CLOSE' : 'MENU'}
          </button>
        </div>
      </header>

      <div className={`nav-overlay ${menuOpen ? 'is-open' : ''}`}>
        <ul>
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href} onClick={(e) => handleNavClick(e, link.href)} data-interactive>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
