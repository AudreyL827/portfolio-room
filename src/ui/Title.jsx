import { CONTENT } from '../content.js'
import { useStore } from '../store.js'
import { sfx } from '../audio.js'

export function Title() {
  const enter = useStore((s) => s.enter)
  const beyond = useStore((s) => s.beyond)
  return (
    <div className="title-screen">
      <p className="title-eyebrow">{beyond ? 'welcome back' : 'you are alone here'}</p>
      <h1>{CONTENT.siteTitle}</h1>
      <p className="title-tagline">{beyond ? 'the room remembers you' : CONTENT.tagline}</p>
      <div className="title-instructions">
        <span>← → walk the room</span>
        <span>↑ ↓ ceiling &amp; floor</span>
        <span className="title-instr-colour">touch what has colour — it remembers her</span>
      </div>
      <button
        className="enter-btn"
        onClick={() => {
          sfx.init()
          sfx.whoosh()
          enter()
        }}
      >
        enter the room
      </button>
      <p className="title-hint">sound on · best with headphones</p>
      <p className="title-whisper">{CONTENT.hints.title}</p>
      <p className="title-credit">{CONTENT.musicCredit}</p>
    </div>
  )
}
