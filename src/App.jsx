import { useState } from 'react'
import SceneCanvas from './three/SceneCanvas'
import Loader from './components/Loader'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Hero from './sections/Hero'
import SceneBody from './sections/SceneBody'
import SceneWheels from './sections/SceneWheels'
import SceneLight from './sections/SceneLight'
import SceneInterior from './sections/SceneInterior'
import Stats from './sections/Stats'
import Configurator from './sections/Configurator'
import FinalCTA from './sections/FinalCTA'
import { ConfigProvider, useConfig } from './state/ConfigContext'
import { useIsMobile } from './hooks/useMediaQuery'

function Experience3D() {
  const { bodyColor, wheel, interior } = useConfig()
  const isMobile = useIsMobile()
  return <SceneCanvas bodyColor={bodyColor} wheelOption={wheel} interiorColor={interior} isMobile={isMobile} />
}

export default function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <ConfigProvider>
      {!loaded && <Loader onFinish={() => setLoaded(true)} />}

      <div className="canvas-layer">
        <Experience3D />
      </div>

      <Nav />

      <main className="site-content" id="top">
        <Hero />
        <SceneBody />
        <SceneWheels />
        <SceneLight />
        <SceneInterior />
        <Stats />
        <Configurator />
        <FinalCTA />
        <Footer />
      </main>
    </ConfigProvider>
  )
}
