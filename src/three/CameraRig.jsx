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
export const EYE = -6.2
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
    let targetYaw, targetPitch, targetFov
    if (cinema) {
      // face the screen (screen centre y=-3.0, wall at z≈7.9)
      targetYaw = SCREEN_YAW
      targetPitch = Math.atan2(-3.0 - EYE, 7.9)
      targetFov = 30
      // yaw damp takes the short way round: unwrap current yaw near π
      const twoPi = Math.PI * 2
      let cur = camera.rotation.y % twoPi
      if (cur - targetYaw > Math.PI) cur -= twoPi
      if (targetYaw - cur > Math.PI) cur += twoPi
      camera.rotation.y = THREE.MathUtils.damp(cur, targetYaw, 2.2, dt)
    } else {
      targetYaw = -Math.PI / 4 - corner * Math.PI * 0.5
      targetPitch = view === 'floor' ? -1.15 : view === 'ceiling' ? 1.25 : 0.08
      targetFov = 74
      camera.rotation.y = THREE.MathUtils.damp(camera.rotation.y, targetYaw - state.pointer.x * 0.05, 3.2, dt)
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
