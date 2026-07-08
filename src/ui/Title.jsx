import { useCallback, useEffect, useRef, useState } from 'react'
import { CONTENT } from '../content.js'
import { useStore } from '../store.js'
import { sfx } from '../audio.js'

// The threshold. No button, no chrome — a name, a room, one line.
// The whole screen is the way in (so are Enter and Space).
//
// Leaving happens in two acts so it stays silky: first the letters
// drift apart and dissolve while the vignette closes to black — the
// room does NOT load yet, so nothing stutters. Only once the screen is
// dark does the gallery mount behind it; then the black lifts as the
// camera eases forward, like stepping through.
export function Title() {
  const phase = useStore((s) => s.phase)
  const enter = useStore((s) => s.enter)
  const beyond = useStore((s) => s.beyond)
  const [act, setAct] = useState(0) // 0 waiting · 1 dissolving · 2 black lifting
  const timers = useRef([])

  const begin = useCallback(() => {
    setAct((current) => {
      if (current !== 0) return current
      sfx.init()
      sfx.whoosh()
      timers.current.push(
        setTimeout(() => {
          enter() // mount the room behind the black
          setAct(2)
        }, 1900),
        setTimeout(() => setAct(0), 3600)
      )
      return 1
    })
  }, [enter])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

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

  if (phase === 'room' && act === 0) return null
  return (
    <div
      className={'title-screen' + (act === 1 ? ' title-act1' : '') + (act === 2 ? ' title-act2' : '')}
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
    >
      <div className="title-veil" aria-hidden="true" />
      <div className="title-veil-near" aria-hidden="true" />
      <h1>{CONTENT.siteTitle}</h1>
      <p className="title-tagline">{beyond ? 'the room remembers you' : CONTENT.tagline}</p>
      <p className="title-guide">{CONTENT.hints.title}</p>
    </div>
  )
}
