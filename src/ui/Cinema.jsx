import { useStore } from '../store.js'
import { CONTENT } from '../content.js'
import { sfx } from '../audio.js'

// The thin strip of UI that floats while the projector runs and the
// camera is locked on the screen. The film itself plays in 3D, as a
// video texture on the gallery screen (see three/exhibits.jsx).
export function CinemaUI() {
  const cinema = useStore((s) => s.cinema)
  const closeCinema = useStore((s) => s.closeCinema)
  const finishVideo = useStore((s) => s.finishVideo)
  if (!cinema) return null
  return (
    <div className="cinema-bar">
      {!CONTENT.introVideoSrc && (
        <button
          className="cinema-btn"
          onClick={() => {
            finishVideo()
            sfx.whoosh()
          }}
        >
          the film ends (placeholder) →
        </button>
      )}
      <button
        className="cinema-btn cinema-leave"
        onClick={() => {
          closeCinema()
          sfx.whoosh()
        }}
      >
        leave the cinema · esc
      </button>
    </div>
  )
}

// The eyes-reopening transition after "take me beyond": two dark lids
// part slowly from the player's own point of view, the world arriving
// bright and blurred, then sharp.
export function EyesOpen() {
  const justAwoke = useStore((s) => s.justAwoke)
  const wake = useStore((s) => s.wake)
  if (!justAwoke) return null
  return (
    <div className="eyes" onAnimationEnd={(e) => e.animationName === 'eyes-clear' && wake()}>
      <div className="eyelid eyelid-top" />
      <div className="eyelid eyelid-bottom" />
      <div className="eyes-blur" />
    </div>
  )
}
