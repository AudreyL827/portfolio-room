import { useStore, resetRoom } from '../store.js'
import { sfx } from '../audio.js'
import { CONTENT } from '../content.js'

const WALL_NAMES = ['work', 'about', 'the film', 'the artist']

export function Hud() {
  const { corner, view, toast, muted, setMuted, beyond } = useStore()
  const a = ((corner % 4) + 4) % 4
  const b = (a + 1) % 4
  const label = view === 'floor' ? 'the floor' : view === 'ceiling' ? 'the ceiling' : `${WALL_NAMES[a]} · ${WALL_NAMES[b]}`

  return (
    <>
      <div className="hud-top">
        <span className="hud-name">{CONTENT.siteTitle}</span>
        <span className="hud-view">{label}</span>
        <button
          className="hud-mute"
          onClick={() => {
            const m = !muted
            setMuted(m)
            sfx.setMuted(m)
          }}
        >
          {muted ? 'sound off' : 'sound on'}
        </button>
      </div>
      <div className="hud-bottom">
        <span>← → turn</span>
        <span>↑ ↓ look</span>
        <span>click the coloured parts</span>
        {beyond && (
          <button className="hud-reset" onClick={resetRoom}>
            begin again
          </button>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
