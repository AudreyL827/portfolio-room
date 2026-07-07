import { useEffect, useState } from 'react'
import { CONTENT } from '../content.js'
import { useStore, resetRoom } from '../store.js'
import { sfx } from '../audio.js'

// Every popup is themed to the object that opened it:
//   paper  → un-crumples open, crumples closed (paintings, the vinyl)
//   marble → assembles with stone knocks, crumbles away (statues)
//   video  → the old rolling film
//   void   → the fourth wall breaks
//   letter → the thank-you mail unfolds

function useEscape(onClose) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
}

// open.spotify.com/playlist/X → open.spotify.com/embed/playlist/X
function spotifyEmbed(url) {
  if (!/open\.spotify\.com\/(playlist|album|track)\//.test(url)) return null
  return url.replace('open.spotify.com/', 'open.spotify.com/embed/').split('?')[0]
}

function ItemBody({ id }) {
  const item = CONTENT.items[id]
  if (!item) return null
  const href =
    item.link === 'SPOTIFY' ? CONTENT.spotifyUrl :
    item.link === 'MAILTO' ? `mailto:${CONTENT.email}` :
    item.link
  const embed = id === 'spotify' ? spotifyEmbed(CONTENT.spotifyUrl) : null
  return (
    <>
      <h2>{item.title}</h2>
      <p className="popup-sub">{item.subtitle}</p>
      <p className="popup-body">{item.body}</p>
      {embed && (
        <iframe
          className="spotify-embed"
          src={embed}
          title="Spotify player"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      )}
      {href && item.linkLabel && (
        <a className="popup-link" href={href} target="_blank" rel="noreferrer">
          {item.linkLabel} →
        </a>
      )}
    </>
  )
}

function PaperPopup({ id }) {
  const closePopup = useStore((s) => s.closePopup)
  const [closing, setClosing] = useState(false)
  useEffect(() => { sfx.paper(true) }, [])
  const close = () => {
    if (closing) return
    sfx.paper(false)
    setClosing(true)
    setTimeout(closePopup, 480)
  }
  useEscape(close)
  return (
    <div className="overlay" onClick={close}>
      <div className={`sheet paper ${closing ? 'paper-close' : 'paper-open'}`} onClick={(e) => e.stopPropagation()}>
        <button className="sheet-x" onClick={close}>✕</button>
        <ItemBody id={id} />
      </div>
    </div>
  )
}

function MarblePopup({ id }) {
  const closePopup = useStore((s) => s.closePopup)
  const [closing, setClosing] = useState(false)
  useEffect(() => { sfx.marble(true) }, [])
  const close = () => {
    if (closing) return
    sfx.marble(false)
    setClosing(true)
    setTimeout(closePopup, 620)
  }
  useEscape(close)
  return (
    <div className="overlay" onClick={close}>
      <div className={`sheet marble ${closing ? 'marble-close' : 'marble-open'}`} onClick={(e) => e.stopPropagation()}>
        <button className="sheet-x" onClick={close}>✕</button>
        <ItemBody id={id} />
        {!closing && <div className="marble-dust" />}
      </div>
    </div>
  )
}

function VoidPopup() {
  const goBeyond = useStore((s) => s.goBeyond)
  const [stage, setStage] = useState(0)
  useEffect(() => {
    sfx.voidDrone()
    const t1 = setTimeout(() => setStage(1), 1600)   // "I have been watching you."
    const t2 = setTimeout(() => setStage(2), 4600)   // + 3 seconds of nothing
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  return (
    <div className="void">
      <div className="void-zoom" />
      {stage >= 1 && (
        <div className="void-quote">
          <p className="void-watching">{CONTENT.secretNote.watching}</p>
          <p className="void-by">{CONTENT.secretNote.watchingBy}</p>
        </div>
      )}
      {stage >= 2 && (
        <div className="void-note">
          {CONTENT.secretNote.lines.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
          <a href={CONTENT.planningDocUrl} target="_blank" rel="noreferrer" className="void-attach">
            {CONTENT.secretNote.planningLabel} →
          </a>
          <button
            className="beyond-btn"
            onClick={() => {
              sfx.bloom()
              goBeyond()
            }}
          >
            take me beyond
          </button>
        </div>
      )}
    </div>
  )
}

function LetterPopup() {
  const closePopup = useStore((s) => s.closePopup)
  useEffect(() => { sfx.unfold() }, [])
  useEscape(closePopup)
  return (
    <div className="overlay" onClick={closePopup}>
      <div className="letter" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-x" onClick={closePopup}>✕</button>
        <div className="letter-fold" />
        <h2>{CONTENT.thankYou.title}</h2>
        <p className="popup-body">{CONTENT.thankYou.body}</p>
        <a className="popup-link" href={`mailto:${CONTENT.email}`}>{CONTENT.email}</a>
        <button className="letter-reset" onClick={resetRoom}>
          begin again — wake up in the colourless room
        </button>
      </div>
    </div>
  )
}

export function Popups() {
  const popup = useStore((s) => s.popup)
  if (!popup) return null
  if (popup.kind === 'paper') return <PaperPopup id={popup.id} />
  if (popup.kind === 'marble') return <MarblePopup id={popup.id} />
  if (popup.kind === 'void') return <VoidPopup />
  if (popup.kind === 'letter') return <LetterPopup />
  return null
}
