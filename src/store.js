import { create } from 'zustand'
import { CONTENT } from './content.js'

// The whole story lives in this store:
//   enter → wander → the projector plays your film onto the screen
//   → a hint stirs → the marble cat slides aside → a hidden door
//   → the void → "take me beyond" → you reopen your eyes in colour.

const wentBeyond = (() => {
  try {
    if (new URLSearchParams(location.search).has('reset')) {
      localStorage.removeItem('beyond')
    }
    return localStorage.getItem('beyond') === '1'
  } catch {
    return false
  }
})()

export const useStore = create((set, get) => ({
  phase: 'title',          // 'title' | 'room'
  corner: 0,               // unbounded int; corner % 4 picks which two walls you face
  view: 'walls',           // 'walls' | 'floor' | 'ceiling'
  popup: null,             // { kind, id } | null
  toast: null,
  muted: false,
  cinema: false,           // camera locked onto the projection screen
  watchedVideo: false,
  catMoved: false,         // the marble cat has slid aside
  beyond: wentBeyond,      // true = the bright world
  justAwoke: false,        // plays the eyes-reopening transition once

  enter: () => set({ phase: 'room' }),
  turn: (dir) => set((s) => ({ corner: s.corner + dir, view: 'walls' })),
  look: (view) => set({ view }),
  openPopup: (kind, id) => set({ popup: { kind, id } }),
  closePopup: () => set({ popup: null }),
  setMuted: (muted) => set({ muted }),
  say: (msg, ms = 5200) => {
    set({ toast: msg })
    clearTimeout(get()._toastTimer)
    const t = setTimeout(() => set({ toast: null }), ms)
    set({ _toastTimer: t })
  },

  openCinema: () => set({ cinema: true, view: 'walls', popup: null }),
  closeCinema: () => set({ cinema: false }),
  finishVideo: () => {
    const s = get()
    set({ cinema: false })
    if (s.watchedVideo || s.beyond) return
    set({ watchedVideo: true })
    setTimeout(() => get().say(CONTENT.hints.afterFilm, 7000), 1400)
  },
  moveCat: () => {
    const s = get()
    if (s.catMoved) return
    if (!s.watchedVideo) {
      s.say(CONTENT.hints.catAsleep)
      return
    }
    set({ catMoved: true })
    setTimeout(() => get().say(CONTENT.hints.doorFound, 6000), 1600)
  },
  goBeyond: () => {
    try { localStorage.setItem('beyond', '1') } catch { /* private mode */ }
    set({
      beyond: true,
      justAwoke: true,
      popup: null,
      cinema: false,
      watchedVideo: false,
      catMoved: false,
      view: 'walls',
    })
  },
  wake: () => set({ justAwoke: false }),
}))

// Hard reset: forget "beyond" and reload into the colourless room.
// The ?reset query is a second safety net — the store also clears the
// flag when it sees it at boot.
export function resetRoom() {
  try { localStorage.removeItem('beyond') } catch { /* private mode */ }
  window.location.replace(window.location.pathname + '?reset')
}

// handy while developing: poke the story from the browser console,
// e.g. __room.getState().finishVideo()
window.__room = useStore
