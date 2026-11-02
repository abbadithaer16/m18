// Mutable state shared between scroll (GSAP) and the render loop, kept out of
// React so scrolling never re-renders components.
//   morph: 0 listening (orb), 1 thinking (galaxy), 2 remembering (brain)
//   override: set by the "Try the three states" controls while that section is in view
//   offsetX: horizontal placement on wide screens, so the field sits beside the copy
//   offsetYMobile: vertical placement on phones, where copy and field stack
export const fieldState = {
  morph: 0,
  override: null,
  offsetX: 1.9,
  offsetYMobile: 1.2,
}

export const STATES = [
  { id: 'listening', label: 'Listening', morph: 0 },
  { id: 'thinking', label: 'Thinking', morph: 1 },
  { id: 'remembering', label: 'Remembering', morph: 2 },
]
