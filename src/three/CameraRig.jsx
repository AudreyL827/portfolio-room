import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store.js'
import { sfx } from '../audio.js'

// You stand at the centre of the room at museum eye level, always
// facing a corner, so two walls are in view at once. Arrow keys turn
// you (with easing, so you glimpse the other walls mid-turn) or tilt
// you to the floor / ceiling.
//
// When the projector runs, the camera leaves your hands: it swings to
// face the projection screen (wall 2, at +z) and the lens tightens —
// a slow dolly-zoom into the cinema.
export const EYE = -5.9
const SCREEN_YAW = Math.PI          // facing +z

export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const { corner, view, turn, look } = useStore()
  const cinema = useStore((s) => s.cinema)

  useEffect(() => {
    camera.rotation.order = 'YXZ'
  }, [camera])

  useEffect(() => {
    const onKey = (e) => {
      const st = useStore.getState()
      if (e.key === 'Escape' && st.cinema) {
        st.closeCinema()
        sfx.whoosh()
        return
      }
      if (st.popup || st.cinema) return
      const v = st.view
      if (e.key === 'ArrowLeft') { turn(-1); sfx.whoosh() }
      else if (e.key === 'ArrowRight') { turn(1); sfx.whoosh() }
      else if (e.key === 'ArrowDown') { look(v === 'ceiling' ? 'walls' : 'floor'); sfx.whoosh() }
      else if (e.key === 'ArrowUp') { look(v === 'floor' ? 'walls' : 'ceiling'); sfx.whoosh() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [turn, look])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    // yaw always damps the short way round (no 360° spins in or out of
    // the cinema): unwrap the current yaw to within π of the target
    const shortDamp = (target, lambda) => {
      const twoPi = Math.PI * 2
      let cur = camera.rotation.y
      while (cur - target > Math.PI) cur -= twoPi
      while (target - cur > Math.PI) cur += twoPi
      camera.rotation.y = THREE.MathUtils.damp(cur, target, lambda, dt)
    }
    let targetPitch, targetFov
    if (cinema) {
      // face the screen (screen centre y=-3.0, wall at z≈7.9)
      targetPitch = Math.atan2(-3.0 - EYE, 7.9)
      targetFov = 30
      shortDamp(SCREEN_YAW, 2.2)
    } else {
      targetPitch = view === 'floor' ? -1.15 : view === 'ceiling' ? 1.25 : 0.08
      targetFov = 74
      shortDamp(-Math.PI / 4 - corner * Math.PI * 0.5 - state.pointer.x * 0.05, 3.2)
    }
    camera.rotation.x = THREE.MathUtils.damp(
      camera.rotation.x,
      targetPitch + (cinema ? 0 : state.pointer.y * 0.04),
      cinema ? 2.2 : 3.2,
      dt
    )
    camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 2.4, dt)
    camera.updateProjectionMatrix()
    camera.position.y = EYE + Math.sin(t * 0.5) * 0.04
  })

  return null
}
