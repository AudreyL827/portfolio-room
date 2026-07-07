import { useCallback, useEffect, useState } from 'react'
import { CONTENT } from '../content.js'
import { useStore } from '../store.js'
import { sfx } from '../audio.js'

// The threshold. No button, no chrome — a name, a room, one line.
// The whole screen is the way in (so are Enter and Space). Beginning
// doesn't click; it transports: a slow zoom inward while the vignette
// closes and the world blurs, then the gallery is simply there.
export function Title() {
  const phase = useStore((s) => s.phase)
  const enter = useStore((s) => s.enter)
  const beyond = useStore((s) => s.beyond)
  const [leaving, setLeaving] = useState(false)

  const begin = useCallback(() => {
    if (leaving) return
    sfx.init()
    sfx.whoosh()
    setLeaving(true)
    enter() // the room starts waking behind the veil
  }, [leaving, enter])

  useEffect(() => {
    if (phase !== 'title') return
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        begin()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, begin])

  if (phase === 'room' && !leaving) return null
  return (
    <div
      className={'title-screen' + (leaving ? ' title-leaving' : '')}
      role="button"
      tabIndex={0}
      aria-label="enter the room"
      onClick={begin}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          begin()
        }
      }}
      onAnimationEnd={(e) => {
        if (e.animationName === 'title-depart' || e.animationName === 'title-depart-still') {
          setLeaving(false)
        }
      }}
    >
      <div className="title-veil" aria-hidden="true" />
      <div className="title-veil-near" aria-hidden="true" />
      <h1>{CONTENT.siteTitle}</h1>
      <p className="title-tagline">{beyond ? 'the room remembers you' : CONTENT.tagline}</p>
      <p className="title-guide">{CONTENT.hints.title}</p>
    </div>
  )
}
