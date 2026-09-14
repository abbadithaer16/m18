import { BRAND, FOOTER_LINKS } from '../data/content'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="hairline" />
      <div className="footer-row">
        <div className="footer-brand">
          <span className="footer-brand-name">{BRAND.name}</span>
          <span className="label-small">{BRAND.location}</span>
        </div>
        <nav className="footer-links" aria-label="Footer">
          {FOOTER_LINKS.map((link) => (
            <a key={link.label} href={link.href} data-interactive>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
