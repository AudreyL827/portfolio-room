import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { sfx } from '../audio.js'

// Damped-pendulum hover physics: hovering gives the object a little
// angular impulse, then a real spring equation settles it back down.
// This is the "wiggle" every interactive object does.
export function useWiggle(groupRef, { onClick, axis = 'z' } = {}) {
  const sim = useRef({ theta: 0, omega: 0, hovered: false, scale: 1 })

  useFrame((_, dt) => {
    const s = sim.current
    const g = groupRef.current
    if (!g) return
    const clamped = Math.min(dt, 0.05)
    // θ'' = -kθ - cθ'  (stiff spring + damping)
    s.omega += (-34 * s.theta - 5.5 * s.omega) * clamped
    s.theta += s.omega * clamped
    g.rotation[axis] = s.theta * 0.14
    const target = s.hovered ? 1.045 : 1
    s.scale += (target - s.scale) * Math.min(1, clamped * 10)
    g.scale.setScalar(s.scale)
  })

  const over = useCallback((e) => {
    e.stopPropagation()
    const s = sim.current
    if (!s.hovered) {
      s.omega += (Math.random() > 0.5 ? 1 : -1) * (0.9 + Math.random() * 0.5)
      sfx.tick()
    }
    s.hovered = true
    document.body.style.cursor = 'pointer'
  }, [])

  const out = useCallback(() => {
    sim.current.hovered = false
    document.body.style.cursor = 'auto'
  }, [])

  const click = useCallback(
    (e) => {
      e.stopPropagation()
      sim.current.omega += 1.4
      onClick?.()
    },
    [onClick]
  )

  return { onPointerOver: over, onPointerOut: out, onClick: click }
}
