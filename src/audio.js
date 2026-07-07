// All sound is synthesized with the WebAudio API — no audio files needed.
//
// Architecture: every voice feeds `master`, which splits into a dry path
// and a convolver loaded with a generated impulse response — so every
// sound (and the music) carries the echo of a grand, empty hall.
//
// The music is Erik Satie's Gymnopédie No. 1 (public domain), played by
// soft synthesized piano voices. To use a real recording instead (e.g.
// the Philippe Entremont performance you own), drop the file in /public
// and set CONTENT.musicSrc in content.js — it will be used instead.

import { CONTENT } from './content.js'

// Gymnopédie No. 1 — lento, 3/4. Alternating Gmaj7 / Dmaj7 bars with the
// famous falling melody. Notes are MIDI numbers.
const BAR = 3 * 0.88 // three beats, ~68bpm
const BARS = 16
const BASS = { A: 43 /* G2 */, B: 50 /* D3 */ }
const CHORD = { A: [59, 62, 66] /* B3 D4 F#4 */, B: [57, 61, 66] /* A3 C#4 F#4 */ }
// [bar, beat, midi, beats]
const MELODY = [
  [4, 0, 78, 1], [4, 1, 81, 1], [4, 2, 79, 1],
  [5, 0, 78, 1], [5, 1, 73, 1], [5, 2, 71, 1],
  [6, 0, 73, 1], [6, 1, 74, 1], [6, 2, 69, 1],
  [7, 0, 66, 6],
  [9, 0, 69, 1], [9, 1, 71, 1], [9, 2, 73, 1],
  [10, 0, 74, 1], [10, 1, 76, 1], [10, 2, 74, 1],
  [11, 0, 73, 6],
]
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12)

class Sfx {
  constructor() {
    this.ctx = null
    this.muted = false
    this.musicOn = false
  }

  init() {
    if (this.ctx) return
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    this.master = this.ctx.createGain()
    this.master.gain.value = 0.6
    // dry
    this.master.connect(this.ctx.destination)
    // wet: the grand hall
    this.hall = this.ctx.createConvolver()
    this.hall.buffer = this._impulse(4.2, 3.2)
    this.hallGain = this.ctx.createGain()
    this.hallGain.gain.value = 0.55
    this.master.connect(this.hall)
    this.hall.connect(this.hallGain)
    this.hallGain.connect(this.ctx.destination)
    this.startAmbient()
    this.startMusic()
  }

  setMuted(m) {
    this.muted = m
    if (this.master) this.master.gain.value = m ? 0 : 0.6
  }

  // A hall: decaying, slightly darkened stereo noise.
  _impulse(dur, decay) {
    const rate = this.ctx.sampleRate
    const len = Math.floor(rate * dur)
    const buf = this.ctx.createBuffer(2, len, rate)
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch)
      let last = 0
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1
        last = last * 0.72 + white * 0.28 // gentle lowpass = distant walls
        d[i] = last * Math.pow(1 - i / len, decay)
      }
    }
    return buf
  }

  _noise(dur) {
    const n = Math.floor(this.ctx.sampleRate * dur)
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    return src
  }

  _env(peak, a, d, when = 0) {
    const g = this.ctx.createGain()
    const t = this.ctx.currentTime + when
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a)
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d)
    g.connect(this.master)
    return g
  }

  // ---------------- music ----------------
  startMusic() {
    if (this.musicOn) return
    this.musicOn = true
    if (CONTENT.musicSrc) {
      // ✏️ real recording path: /public file set in content.js
      const el = new Audio(CONTENT.musicSrc)
      el.loop = true
      el.volume = 0.5
      const src = this.ctx.createMediaElementSource(el)
      src.connect(this.master)
      el.play().catch(() => {})
      return
    }
    const loop = () => {
      const t0 = this.ctx.currentTime + 0.15
      this._scheduleGymnopedie(t0)
      this._musicTimer = setTimeout(loop, BARS * BAR * 1000 - 400)
    }
    loop()
  }

  _piano(midi, t, beats, peak) {
    const o = this.ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.value = hz(midi)
    const lp = this.ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 1500
    const g = this.ctx.createGain()
    const dur = beats * (BAR / 3)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + 0.025)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 1.3 + 0.4)
    o.connect(lp).connect(g).connect(this.master)
    o.start(t)
    o.stop(t + dur * 1.3 + 0.5)
  }

  _scheduleGymnopedie(t0) {
    const beat = BAR / 3
    for (let bar = 0; bar < BARS; bar++) {
      const t = t0 + bar * BAR
      const side = bar % 2 ? 'B' : 'A'
      this._piano(BASS[side], t, 2.6, 0.075)
      for (const m of CHORD[side]) this._piano(m, t + beat, 1.6, 0.03)
    }
    for (const [bar, b, midi, beats] of MELODY) {
      this._piano(midi, t0 + bar * BAR + b * beat, beats, 0.085)
    }
  }

  // ---------------- room tone ----------------
  startAmbient() {
    const noise = this._noise(4)
    noise.loop = true
    const lp = this.ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 90
    const g = this.ctx.createGain()
    g.gain.value = 0.025
    noise.connect(lp).connect(g).connect(this.master)
    noise.start()
  }

  // ---------------- gestures ----------------
  // A soft felt tap — a fingertip touching something old.
  tick() {
    if (!this.ctx) return
    const o = this.ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(430, this.ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(210, this.ctx.currentTime + 0.07)
    o.connect(this._env(0.06, 0.005, 0.09))
    o.start()
    o.stop(this.ctx.currentTime + 0.12)
    const n = this._noise(0.03)
    const lp = this.ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 900
    n.connect(lp).connect(this._env(0.04, 0.002, 0.03))
    n.start()
  }

  // Slow air moving as the whole room turns around you.
  whoosh() {
    if (!this.ctx) return
    const n = this._noise(1.1)
    const bp = this.ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 0.9
    const t = this.ctx.currentTime
    bp.frequency.setValueAtTime(140, t)
    bp.frequency.exponentialRampToValueAtTime(480, t + 0.45)
    bp.frequency.exponentialRampToValueAtTime(110, t + 1.0)
    n.connect(bp).connect(this._env(0.13, 0.18, 0.85))
    n.start()
  }

  // Paper: a dense little storm of high crackles.
  paper(opening = true) {
    if (!this.ctx) return
    for (let i = 0; i < 22; i++) {
      const when = (opening ? i : 21 - i) * 0.02 + Math.random() * 0.015
      const n = this._noise(0.035)
      const hp = this.ctx.createBiquadFilter()
      hp.type = 'bandpass'
      hp.Q.value = 2.5
      hp.frequency.value = 1800 + Math.random() * 3600
      n.connect(hp).connect(this._env(0.05 + Math.random() * 0.05, 0.003, 0.03, when))
      n.start(this.ctx.currentTime + when)
    }
  }

  // Marble: deep stone settling, with grit.
  marble(building = true) {
    if (!this.ctx) return
    for (let i = 0; i < 5; i++) {
      const when = i * 0.11 + Math.random() * 0.03
      const o = this.ctx.createOscillator()
      o.type = 'sine'
      const f = building ? 70 + i * 22 : 160 - i * 22
      o.frequency.setValueAtTime(f * 1.6, this.ctx.currentTime + when)
      o.frequency.exponentialRampToValueAtTime(f, this.ctx.currentTime + when + 0.09)
      o.connect(this._env(0.22, 0.006, 0.22, when))
      o.start(this.ctx.currentTime + when)
      o.stop(this.ctx.currentTime + when + 0.3)
    }
    const n = this._noise(0.7)
    const bp = this.ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 1
    bp.frequency.value = 480
    n.connect(bp).connect(this._env(0.06, 0.08, 0.55))
    n.start()
  }

  // The key hitting the parquet.
  clink() {
    if (!this.ctx) return
    ;[2350, 3150, 4600].forEach((f, i) => {
      const o = this.ctx.createOscillator()
      o.frequency.value = f + Math.random() * 150
      o.connect(this._env(0.12 - i * 0.03, 0.002, 0.3, i * 0.015))
      o.start(this.ctx.currentTime + i * 0.015)
      o.stop(this.ctx.currentTime + 0.5)
    })
  }

  // The void: a swelling dark drone.
  voidDrone() {
    if (!this.ctx) return
    ;[38, 57, 76].forEach((f) => {
      const o = this.ctx.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = f
      const lp = this.ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 200
      const g = this.ctx.createGain()
      const t = this.ctx.currentTime
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.05, t + 2.5)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 8)
      o.connect(lp).connect(g).connect(this.master)
      o.start()
      o.stop(t + 8.2)
    })
  }

  // Colour returning: a warm rising chord.
  bloom() {
    if (!this.ctx) return
    ;[262, 330, 392, 523].forEach((f, i) => {
      const o = this.ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = f
      o.connect(this._env(0.12, 0.4 + i * 0.15, 2.4, i * 0.12))
      o.start(this.ctx.currentTime + i * 0.12)
      o.stop(this.ctx.currentTime + 4.2)
    })
  }

  // A small, sleepy meow — pitch rises then falls, with a little vibrato.
  meow() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    const o = this.ctx.createOscillator()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(420, t)
    o.frequency.exponentialRampToValueAtTime(780, t + 0.16)
    o.frequency.exponentialRampToValueAtTime(340, t + 0.55)
    const vib = this.ctx.createOscillator()
    vib.frequency.value = 24
    const vibGain = this.ctx.createGain()
    vibGain.gain.value = 26
    vib.connect(vibGain).connect(o.frequency)
    const bp = this.ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 1.6
    bp.frequency.setValueAtTime(900, t)
    bp.frequency.exponentialRampToValueAtTime(1500, t + 0.16)
    bp.frequency.exponentialRampToValueAtTime(700, t + 0.55)
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.14, t + 0.07)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
    o.connect(bp).connect(g).connect(this.master)
    o.start(t)
    vib.start(t)
    o.stop(t + 0.65)
    vib.stop(t + 0.65)
  }

  // Paper unfolding (the thank-you letter).
  unfold() {
    if (!this.ctx) return
    for (let i = 0; i < 4; i++) {
      const n = this._noise(0.07)
      const hp = this.ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = 1100
      n.connect(hp).connect(this._env(0.05, 0.01, 0.06, i * 0.17))
      n.start(this.ctx.currentTime + i * 0.17)
    }
  }
}

export const sfx = new Sfx()
