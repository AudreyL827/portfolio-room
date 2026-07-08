import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { plaqueTexture } from '../sketch.js'
import { Model } from './Model.jsx'
import { CATALOG, useArtTexture, useWeaveBump } from '../art.js'
import { CONTENT } from '../content.js'
import { useStore } from '../store.js'
import { useWiggle } from './hooks.js'
import { sfx } from '../audio.js'
import { H } from './Room.jsx'

// Small museum label. Pass an item `id` (your pieces, text from
// content.js) OR explicit `title` / `sub` (the masterpieces).
export function Plaque({ id, title, sub, position }) {
  const tex = useMemo(() => {
    if (id) {
      const [t, s] = CONTENT.plaques[id] ?? ['Untitled', '']
      return plaqueTexture(t, s)
    }
    return plaqueTexture(title ?? 'Untitled', sub ?? '')
  }, [id, title, sub])
  return (
    <mesh position={position}>
      <planeGeometry args={[0.78, 0.29]} />
      <meshStandardMaterial map={tex} roughness={0.7} />
    </mesh>
  )
}

// A framed masterpiece. The painting is a real public-domain artwork
// (sepia in the colourless world, true colours after "beyond"), with a
// subtle canvas-weave bump. If `id` + `icon` are given, ONE small
// coloured Style-D element sits inside it and only that spot is
// clickable — hovering swings the frame on its hook.
//
//  art   catalog id from art.js ('starry', 'wave', …)
//  icon  { name, accent, fx, fy, fs } — fractional position + size
//  pos   [x, y] wall-local · w — frame width in metres (height follows
//        the painting's real aspect ratio)
export function Artwork({ id, art, icon, pos = [0, 0], w = 2, seed = 7, P, plaque = false }) {
  const ref = useRef()
  const openPopup = useStore((s) => s.openPopup)
  const handlers = useWiggle(ref, { onClick: () => id && openPopup(CONTENT.items[id]?.popup ?? 'paper', id) })
  const entry = CATALOG[art]
  const h = w / (entry?.aspect ?? 1.33)
  const mode = P.name === 'beyond' ? 'beyond' : 'beige'
  const tex = useArtTexture(art, { mode, icon, seed })
  const bump = useWeaveBump()
  // the canvas material is managed imperatively: swapping `map` on a
  // compiled material needs an explicit needsUpdate to recompile
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: P.canvas, roughness: 0.88 }),
    [P]
  )
  useEffect(() => {
    if (!tex) return
    mat.map = tex
    mat.bumpMap = bump
    mat.bumpScale = 0.012
    mat.color.set('#ffffff')
    mat.needsUpdate = true
  }, [tex, mat, bump])
  // tiny per-painting depth stagger so neighbouring frames never z-clip
  const zStagger = ((String(art).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 5) - 2) * 0.008
  return (
    <group position={[pos[0], pos[1], -H + 0.1 + zStagger]}>
      <group ref={ref}>
        <mesh castShadow>
          <boxGeometry args={[w + 0.3, h + 0.3, 0.12]} />
          <meshStandardMaterial color={P.frame} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.055]}>
          <planeGeometry args={[w + 0.12, h + 0.12]} />
          <meshStandardMaterial color={P.liner} metalness={0.45} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0, 0.065]} material={mat}>
          <planeGeometry args={[w, h]} />
        </mesh>
        {/* the clickable coloured part — an invisible disc over the icon */}
        {id && icon && (
          <mesh position={[(icon.fx - 0.5) * w, (0.5 - icon.fy) * h, 0.09]} {...handlers}>
            <circleGeometry args={[Math.max(0.22, (icon.fs / 100) * Math.min(w, h) * 0.8), 16]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )}
      </group>
      {plaque && id && <Plaque id={id} position={[0, -h / 2 - 0.42, 0]} />}
      {!id && entry && <Plaque title={entry.title} sub={entry.artist} position={[0, -h / 2 - 0.42, 0]} />}
    </group>
  )
}

// A painting that arrived as a full 3D scan, frame and all (GLB).
// Hung directly on the wall; sepia-drained in the colourless world.
export function GlbPainting({ url, pos = [0, 0], height = 1.8, preRotate = [0, 0, 0], P }) {
  return (
    <group position={[pos[0], pos[1], -H + 0.16]}>
      <Suspense fallback={null}>
        <Model
          url={url}
          height={height}
          preRotate={preRotate}
          anchor="center"
          mode={P.name === 'beyond' ? 'beyond' : 'beige'}
        />
      </Suspense>
    </group>
  )
}

// An antique gramophone: dark wood cabinet with panel mouldings, a
// brass horn, a crank — and the record on a tilted deck so you can see
// it turn. The coloured label is the clickable part; the disc spins
// faster while the music popup is open.
export function VinylPlayer({ pos = [0, 0], accent = '#e07b2f', P }) {
  const ref = useRef()
  const disc = useRef()
  const openPopup = useStore((s) => s.openPopup)
  const playing = useStore((s) => s.popup?.id === 'spotify')
  const handlers = useWiggle(ref, { onClick: () => openPopup('paper', 'spotify'), axis: 'y' })
  useFrame((state, dt) => {
    if (disc.current) {
      disc.current.rotation.y += dt * (playing ? 4.2 : 1.8)
      disc.current.rotation.z = Math.sin(state.clock.elapsedTime * 6) * 0.004
    }
  })
  const wood = <meshStandardMaterial color="#3d2b1c" roughness={0.55} />
  const brass = <meshStandardMaterial color="#a8853e" metalness={0.75} roughness={0.32} />
  return (
    <group position={[pos[0], -H, pos[1] - H + 1.6]}>
      <group ref={ref} {...handlers}>
        {/* wooden cabinet with inset panels and little feet */}
        <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.08, 0.95]} />
          {wood}
        </mesh>
        <mesh position={[0, 0.5, 0.48]}>
          <boxGeometry args={[1.2, 0.6, 0.02]} />
          <meshStandardMaterial color="#4d3826" roughness={0.6} />
        </mesh>
        {[-0.62, 0.62].map((x) =>
          [-0.38, 0.38].map((z) => (
            <mesh key={x + ':' + z} position={[x, 0.05, z]} castShadow>
              <cylinderGeometry args={[0.05, 0.07, 0.12, 8]} />
              {wood}
            </mesh>
          ))
        )}
        <mesh position={[0, 1.18, 0]} castShadow>
          <boxGeometry args={[1.6, 0.07, 1.05]} />
          {wood}
        </mesh>
        {/* deck, tilted toward the room so the record face is visible */}
        <group position={[0, 1.26, 0.1]} rotation-x={0.3}>
          <mesh castShadow>
            <boxGeometry args={[1.3, 0.07, 0.85]} />
            {wood}
          </mesh>
          <mesh position={[-0.12, 0.06, 0]}>
            <cylinderGeometry args={[0.45, 0.47, 0.05, 36]} />
            <meshStandardMaterial color="#241f19" roughness={0.5} />
          </mesh>
          {/* the record — off-centre label, index line, visible spin */}
          <group ref={disc} position={[-0.12, 0.1, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.42, 0.42, 0.016, 40]} />
              <meshStandardMaterial color="#17130f" roughness={0.3} />
            </mesh>
            <mesh position={[0.03, 0.01, 0.015]}>
              <cylinderGeometry args={[0.16, 0.16, 0.008, 24]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} roughness={0.5} />
            </mesh>
            <mesh position={[0.28, 0.01, 0]}>
              <boxGeometry args={[0.12, 0.004, 0.02]} />
              <meshStandardMaterial color="#d8cfc0" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.05, 8]} />
              {brass}
            </mesh>
          </group>
          {/* tonearm */}
          <mesh position={[0.5, 0.1, -0.26]} castShadow>
            <cylinderGeometry args={[0.035, 0.045, 0.1, 10]} />
            {brass}
          </mesh>
          <mesh position={[0.32, 0.14, -0.1]} rotation-z={0.24} rotation-y={0.7} castShadow>
            <cylinderGeometry args={[0.013, 0.013, 0.5, 6]} />
            {brass}
          </mesh>
        </group>
        {/* the brass horn, blooming up and back */}
        <group position={[0.42, 1.5, -0.32]} rotation-x={-0.5} rotation-z={-0.15}>
          <mesh castShadow>
            <cylinderGeometry args={[0.035, 0.05, 0.35, 12]} />
            {brass}
          </mesh>
          <mesh position={[0, 0.36, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.05, 0.5, 18, 1, true]} />
            <meshStandardMaterial color="#a8853e" metalness={0.75} roughness={0.32} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.62, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.3, 0.02, 8, 24]} />
            {brass}
          </mesh>
        </group>
        {/* crank */}
        <mesh position={[0.78, 0.7, 0]} rotation-z={Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.14, 6]} />
          {brass}
        </mesh>
        <mesh position={[0.86, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.16, 6]} />
          {wood}
        </mesh>
      </group>
      <group position={[0, 0.5, 0.78]} rotation-x={-0.45}>
        <Plaque id="spotify" position={[0, 0, 0]} />
      </group>
    </group>
  )
}

// The projector: an old rolling-film machine aimed at the screen.
// Clicking it starts the cinema — the camera swings and zooms onto the
// projected film. The reel is the coloured part.
export function Projector({ pos = [0, 0], accent = '#efd53c', P }) {
  const ref = useRef()
  const reel = useRef()
  const openCinema = useStore((s) => s.openCinema)
  const cinema = useStore((s) => s.cinema)
  const handlers = useWiggle(ref, {
    onClick: () => {
      openCinema()
      sfx.whoosh()
    },
    axis: 'y',
  })
  useFrame((_, dt) => {
    if (reel.current) reel.current.rotation.z += dt * (cinema ? 4.5 : 0.9)
  })
  return (
    <group position={[pos[0], -H, pos[1] - H + 3.6]}>
      <group ref={ref} {...handlers}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.1, 1.1, 10]} />
          <meshStandardMaterial color={P.bench} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.4, 0.46, 0.12, 12]} />
          <meshStandardMaterial color={P.bench} roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.3, 0]} castShadow>
          <boxGeometry args={[0.8, 0.55, 0.5]} />
          <meshStandardMaterial color={P.chandelier} roughness={0.55} metalness={0.2} />
        </mesh>
        <mesh position={[0, 1.35, -0.35]} rotation-x={Math.PI / 2 - 0.12} castShadow>
          <cylinderGeometry args={[0.1, 0.13, 0.3, 12]} />
          <meshStandardMaterial color="#111" roughness={0.3} />
        </mesh>
        {/* THE coloured reel */}
        <group ref={reel} position={[0.05, 1.85, 0.1]}>
          <mesh castShadow>
            <torusGeometry args={[0.34, 0.05, 8, 24]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} roughness={0.5} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} rotation-z={(i * Math.PI) / 3}>
              <boxGeometry args={[0.66, 0.05, 0.04]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.3} roughness={0.5} />
            </mesh>
          ))}
        </group>
        {/* light cone toward the screen, brighter while running */}
        <mesh position={[0, 1.6, -1.8]} rotation-x={-Math.PI / 2 + 0.28}>
          <coneGeometry args={[0.8, 3.0, 16, 1, true]} />
          <meshBasicMaterial color="#fff6dd" transparent opacity={cinema ? 0.16 : 0.06} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <group position={[1.05, 0.4, 0.4]} rotation-x={-0.45}>
        <Plaque id="reel" position={[0, 0, 0]} />
      </group>
    </group>
  )
}

// A "no film yet" slate for the projection screen.
function slateTexture() {
  const c = document.createElement('canvas')
  c.width = 768
  c.height = 512
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#141210'
  ctx.fillRect(0, 0, 768, 512)
  ctx.strokeStyle = 'rgba(240,232,210,.5)'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(384, 210, 90, 0, 7)
  ctx.stroke()
  ctx.fillStyle = '#f0e8d2'
  ctx.font = 'italic 84px Georgia'
  ctx.textAlign = 'center'
  ctx.fillText('3', 384, 240)
  ctx.font = 'italic 30px Georgia'
  ctx.fillText('something waits behind the screen', 384, 370)
  ctx.font = '22px Georgia'
  ctx.fillStyle = 'rgba(240,232,210,.55)'
  ctx.fillText('video making in progress...', 384, 415)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// The projection screen. When the cinema runs, your film is broadcast
// onto it as a live video texture and the screen leans into the light.
export function Screen({ P }) {
  const cinema = useStore((s) => s.cinema)
  const finishVideo = useStore((s) => s.finishVideo)
  const group = useRef()

  const video = useMemo(() => {
    if (!CONTENT.introVideoSrc) return null
    const v = document.createElement('video')
    v.src = CONTENT.introVideoSrc
    v.playsInline = true
    v.preload = 'auto'
    return v
  }, [])
  const videoTex = useMemo(() => {
    if (!video) return null
    const t = new THREE.VideoTexture(video)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [video])
  const slate = useMemo(() => slateTexture(), [])

  useEffect(() => {
    if (!video) return
    const onEnd = () => finishVideo()
    video.addEventListener('ended', onEnd)
    return () => video.removeEventListener('ended', onEnd)
  }, [video, finishVideo])

  useEffect(() => {
    if (!video) return
    if (cinema) {
      video.currentTime = 0
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [cinema, video])

  useFrame((_, dt) => {
    if (!group.current) return
    const s = THREE.MathUtils.damp(group.current.scale.x, cinema ? 1.14 : 1, 3, dt)
    group.current.scale.setScalar(s)
  })

  const showFilm = cinema
  return (
    <group ref={group} position={[0, -3.0, -H + 0.1]}>
      <mesh castShadow>
        <boxGeometry args={[4.6, 3.1, 0.1]} />
        <meshStandardMaterial color={P.frame} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[4.3, 2.8]} />
        {showFilm ? (
          <meshBasicMaterial map={videoTex ?? slate} toneMapped={false} />
        ) : (
          <meshStandardMaterial color={P.screen} emissive={P.screen} emissiveIntensity={0.05} roughness={0.9} />
        )}
      </mesh>
    </group>
  )
}
