import { BRAND, FOOTER_LINKS, MODEL_CREDIT } from '../data/content'
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
      <p className="footer-credit">
        Vehicle model based on{' '}
        <a href={MODEL_CREDIT.sourceUrl} target="_blank" rel="noreferrer" data-interactive>
          {MODEL_CREDIT.title}
        </a>{' '}
        by {MODEL_CREDIT.author}, licensed{' '}
        <a href={MODEL_CREDIT.licenseUrl} target="_blank" rel="noreferrer" data-interactive>
          {MODEL_CREDIT.license}
        </a>
        . Modified: logos removed, materials and textures adapted.
      </p>
    </footer>
  )
}
