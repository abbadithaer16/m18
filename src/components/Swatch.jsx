import './Swatch.css'

export default function Swatch({ color, label, active, onClick }) {
  return (
    <button
      type="button"
      className={`swatch ${active ? 'is-active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
      data-interactive
    >
      <span className="swatch-dot" style={{ background: color }} />
      <span className="swatch-label">{label}</span>
    </button>
  )
}
