import { Canvas } from '@react-three/fiber'
import { useStore } from './store.js'
import { Scene } from './three/Scene.jsx'
import { Title } from './ui/Title.jsx'
import { Hud } from './ui/Hud.jsx'
import { Popups } from './ui/Popups.jsx'
import { CinemaUI, EyesOpen } from './ui/Cinema.jsx'

export default function App() {
  const phase = useStore((s) => s.phase)
  return (
    <div className="app">
      <Canvas
        shadows
        camera={{ position: [0, 0, 0], fov: 74, near: 0.1, far: 80 }}
        gl={{ antialias: true }}
      >
        {phase === 'room' && <Scene />}
      </Canvas>
      <Title />
      {phase === 'room' && <Hud />}
      {phase === 'room' && <CinemaUI />}
      <Popups />
      <EyesOpen />
    </div>
  )
}
