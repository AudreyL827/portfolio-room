import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store.js'
import { useWiggle } from './hooks.js'
import { sfx } from '../audio.js'
import { useArtTexture } from '../art.js'
import { Model } from './Model.jsx'
import { Plaque } from './exhibits.jsx'
import { H } from './Room.jsx'
import { ACCENTS } from '../palette.js'

// The key that slips from the chandelier when the film ends.
// Real (tiny) physics: gravity, then damped bounces, each with a clink.
export function FallingKey() {
  const group = useRef()
  const sim = useRef({ y: H - 2.6, vy: 0, rest: false, spin: 2.2 })
  const { watchedVideo, hasKey, keyLanded, landKey, takeKey } = useStore()
  const floorY = -H + 0.09

  useFrame((state, dt) => {
    const g = group.current
    const s = sim.current
    if (!g) return
    const clamped = Math.min(dt, 0.05)
    if (!s.rest) {
      s.vy -= 9.8 * clamped
      s.y += s.vy * clamped
      g.rotation.x += s.spin * clamped
      if (s.y <= floorY) {
        s.y = floorY
        s.vy = -s.vy * 0.42
        s.spin *= 0.5
        sfx.clink()
        if (Math.abs(s.vy) < 0.8) {
          s.rest = true
          g.rotation.x = Math.PI / 2
          landKey()
        }
      }
    } else {
      // glow pulse so it can be found
      const p = 0.5 + Math.sin(state.clock.elapsedTime * 2.4) * 0.5
      g.children.forEach((c) => c.material && (c.material.emissiveIntensity = 0.3 + p * 0.6))
    }
    g.position.y = s.y
  })

  const handlers = useWiggle(group, {
    onClick: () => {
      if (sim.current.rest) takeKey()
    },
    axis: 'y',
  })

  if (!watchedVideo || hasKey) return null
  const mat = { color: ACCENTS.gold, emissive: ACCENTS.gold, emissiveIntensity: 0.5, roughness: 0.35, metalness: 0.4 }
  return (
    <group ref={group} position={[1.6, H - 2.6, 1.6]} {...(keyLanded ? handlers : {})}>
      <mesh castShadow>
        <torusGeometry args={[0.14, 0.045, 8, 18]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[0, -0.3, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.42, 6]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[0.08, -0.44, 0]}>
        <boxGeometry args={[0.14, 0.05, 0.05]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[0.06, -0.34, 0]}>
        <boxGeometry args={[0.1, 0.05, 0.05]} />
        <meshStandardMaterial {...mat} />
      </mesh>
    </group>
  )
}

// The easter egg. A marble cat sleeps on a plinth against the film wall,
// guarding a patch of wainscot. The film wakes the key; the key wakes
// the cat. Click it and the plinth grinds aside — behind it, a little
// door that was never on any floor plan. Wall-local to WallGroup j=2.
export function CatSecret({ P }) {
  const slider = useRef()
  const zone = useRef()
  const seam = useRef()
  const { hasKey, catMoved, moveCat, openPopup } = useStore()
  const [sliding, setSliding] = useState(false)

  const handlers = useWiggle(zone, {
    onClick: () => {
      if (!catMoved && hasKey) {
        setSliding(true)
        sfx.marble(false) // stone grinding aside
      }
      moveCat()
    },
    axis: 'y',
  })

  useFrame((state, dt) => {
    if (slider.current) {
      const target = catMoved ? 1.8 : 0
      const x = THREE.MathUtils.damp(slider.current.position.x, target, sliding ? 1.6 : 8, dt)
      slider.current.position.x = x
      if (sliding && Math.abs(x - target) < 0.03) setSliding(false)
    }
    if (seam.current) {
      seam.current.material.emissiveIntensity = 0.7 + Math.sin(state.clock.elapsedTime * 1.8) * 0.4
    }
  })

  return (
    <group position={[5.1, -H, 0]}>
      {/* the hidden door, flush in the wainscot — only born once the cat moves */}
      {catMoved && (
        <group position={[0, 0, -H + 0.06]}>
          <mesh ref={seam} position={[0, 0.95, -0.01]}>
            <planeGeometry args={[1.3, 1.95]} />
            <meshStandardMaterial color="#ffe9b0" emissive="#ffce6a" emissiveIntensity={1} />
          </mesh>
          <mesh
            position={[0, 0.9, 0]}
            onClick={(e) => { e.stopPropagation(); openPopup('void', 'secret') }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; sfx.tick() }}
            onPointerOut={() => { document.body.style.cursor = 'auto' }}
            castShadow
          >
            <boxGeometry args={[1.15, 1.8, 0.07]} />
            <meshStandardMaterial color={P.door} roughness={0.7} />
          </mesh>
          {/* the keyhole and handle — mounted upside down, the one wrong thing */}
          <mesh position={[0.42, 0.55, 0.06]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.09, 0.025, 8, 18]} />
            <meshStandardMaterial color={ACCENTS.gold} emissive={ACCENTS.gold} emissiveIntensity={0.5} metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0.42, 0.82, 0.045]}>
            <circleGeometry args={[0.035, 10]} />
            <meshStandardMaterial color="#171310" />
          </mesh>
        </group>
      )}
      {/* the sliding plinth + the sleeping marble cat */}
      <group ref={slider}>
        <group ref={zone} {...handlers}>
          <mesh position={[0, 0.3, -H + 1.0]} castShadow receiveShadow>
            <boxGeometry args={[1.3, 0.6, 1.3]} />
            <meshStandardMaterial color={P.pedestal} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.63, -H + 1.0]} castShadow>
            <boxGeometry args={[1.44, 0.08, 1.44]} />
            <meshStandardMaterial color={P.trim} roughness={0.8} />
          </mesh>
          <group position={[0, 0.67, -H + 1.0]} rotation-y={0.5}>
            <Suspense fallback={null}>
              <Model
                url={`${import.meta.env.BASE_URL}models/sleeping-cat.glb`}
                height={0.5}
                anchor="floor"
                marble={P.statue}
              />
            </Suspense>
          </group>
        </group>
        <Plaque id="catstatue" position={[0, 0.34, -H + 1.74]} />
      </group>
    </group>
  )
}

// After "take me beyond": on the about wall, Le Chat Noir hangs where
// nothing hung before — and below it the cat sleeps for real, one
// envelope tucked by its paw. Clicking the cat or the mail wakes a meow
// and unfolds the letter; nothing here swings or slides.
export function CatAndMail({ P }) {
  const tex = useArtTexture('chatnoir', { mode: P.name === 'beyond' ? 'beyond' : 'beige' })
  const openPopup = useStore((s) => s.openPopup)

  // imperative material: swapping `map` on a compiled material needs
  // an explicit needsUpdate (same trick as Artwork)
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: P.canvas, roughness: 0.9 }),
    [P]
  )
  useEffect(() => {
    if (!tex) return
    mat.map = tex
    mat.color.set('#ffffff')
    mat.needsUpdate = true
  }, [tex, mat])

  const wake = (e) => {
    e.stopPropagation()
    sfx.meow()
    openPopup('letter', 'thankyou')
  }
  const over = (e) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    sfx.tick()
  }
  const out = () => { document.body.style.cursor = 'auto' }

  return (
    <group position={[0.85, 0, 0]}>
      {/* a normal painting, hung like nothing happened — not clickable */}
      <group position={[0, -4.3, -H + 0.1]}>
        <mesh castShadow>
          <boxGeometry args={[1.6, 2.06, 0.09]} />
          <meshStandardMaterial color={P.frame} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0, 0.052]} material={mat}>
          <planeGeometry args={[1.4, 1.86]} />
        </mesh>
      </group>
      {/* the sleeping cat, awake to colour: soft warm-grey matte — its
          baked edge-line texture reads noisy under gallery light, so it
          wears the room's sculptural finish instead */}
      <group
        position={[0, -H + 0.02, -H + 1.0]}
        rotation-y={0.4}
        onClick={wake}
        onPointerOver={over}
        onPointerOut={out}
      >
        <Suspense fallback={null}>
          <Model
            url={`${import.meta.env.BASE_URL}models/sleeping-cat.glb`}
            height={0.45}
            anchor="floor"
            marble="#958b91"
          />
        </Suspense>
      </group>
      {/* the envelope, slightly tucked toward the paw */}
      <group
        position={[0.55, -H + 0.045, -H + 1.35]}
        rotation-y={-0.4}
        onClick={wake}
        onPointerOver={over}
        onPointerOut={out}
      >
        <mesh castShadow>
          <boxGeometry args={[0.55, 0.02, 0.4]} />
          <meshStandardMaterial color="#fdf6e8" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.012, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.5, 0.35]} />
          <meshStandardMaterial color="#f3e9d2" roughness={0.9} />
        </mesh>
        <mesh position={[0.12, 0.015, 0.05]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.06, 10]} />
          <meshStandardMaterial color={ACCENTS.red} emissive={ACCENTS.red} emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  )
}
