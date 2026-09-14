import { createContext, useContext, useMemo, useState } from 'react'
import { BODY_COLORS, INTERIOR_COLORS, WHEEL_OPTIONS } from '../data/content'

const ConfigContext = createContext(null)

export function ConfigProvider({ children }) {
  const [bodyColorId, setBodyColorId] = useState(BODY_COLORS[0].id)
  const [wheelId, setWheelId] = useState(WHEEL_OPTIONS[0].id)
  const [interiorId, setInteriorId] = useState(INTERIOR_COLORS[0].id)

  const value = useMemo(
    () => ({
      bodyColor: BODY_COLORS.find((c) => c.id === bodyColorId) ?? BODY_COLORS[0],
      wheel: WHEEL_OPTIONS.find((w) => w.id === wheelId) ?? WHEEL_OPTIONS[0],
      interior: INTERIOR_COLORS.find((i) => i.id === interiorId) ?? INTERIOR_COLORS[0],
      setBodyColorId,
      setWheelId,
      setInteriorId,
    }),
    [bodyColorId, wheelId, interiorId],
  )

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}

export function useConfig() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used within a ConfigProvider')
  return ctx
}
