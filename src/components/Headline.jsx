import { forwardRef } from 'react'

/**
 * Renders a multi-line editorial headline. Kept dumb on purpose — scroll
 * or enter animation is applied to the forwarded root ref by whichever
 * section owns the timing (see `useScrollScene`).
 */
const Headline = forwardRef(function Headline({ lines, size = 'xl', as = 'h2', className = '' }, ref) {
  const Tag = as
  return (
    <Tag ref={ref} className={`headline headline--${size} ${className}`.trim()}>
      {lines.map((line) => (
        <span className="line" key={line}>
          {line}
        </span>
      ))}
    </Tag>
  )
})

export default Headline
