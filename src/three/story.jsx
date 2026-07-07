import { Suspense, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store.js'
import { useWiggle } from './hooks.js'
import { sfx } from '../audio.js'
import { useArtTexture } from '../art.js'
import { Roughen } from './statues.jsx'
import { Plaque } from './exhibits.jsx'
import { Model } from './Model.jsx'
import { H } from './Room.jsx'
import { ACCENTS } from '../palette.js'

// The easter egg. A small marble cat sleeps on a plinth against the
// film wall, guarding a patch of wainscot that looks like every other
// patch of wainscot. After the film, a hint stirs. Click the cat and
// the whole plinth grinds aside — behind it, a little door that was
// never on any floor plan. Rendered inside WallGroup j=2 (wall-local).
export function CatSecret({ P }) {
  const slider = useRef()
  const zone = useRef()
  const seam = useRef()
  const { watchedVideo, catMoved, moveCat, openPopup } = useStore()
  const [sliding, setSliding] = useState(false)

  const handlers = useWiggle(zone, {
    onClick: () => {
      if (!catMoved && watchedVideo) {
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
          {/* the handle — mounted upside down, the one wrong thing */}
          <mesh position={[0.42, 0.55, 0.06]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.09, 0.025, 8, 18]} />
            <meshStandardMaterial color={ACCENTS.gold} emissive={ACCENTS.gold} emissiveIntensity={0.5} metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      )}
      {/* the sliding plinth + cat */}
      <group ref={slider}>
        <group ref={zone} {...handlers}>
          <mesh position={[0, 0.3, -H + 1.0]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.6, 1.2]} />
            <meshStandardMaterial color={P.pedestal} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.63, -H + 1.0]} castShadow>
            <boxGeometry args={[1.34, 0.08, 1.34]} />
            <meshStandardMaterial color={P.trim} roughness={0.8} />
          </mesh>
          <group position={[0, 0.67, -H + 1.0]} rotation-y={0.4}>
            <Suspense fallback={null}>
              <Model
                url={`${import.meta.env.BASE_URL}models/artdeco-cat.glb`}
                height={0.95}
                preRotate={[0, 0, 0]}
                anchor="floor"
                marble={P.statue}
              />
            </Suspense>
          </group>
        </group>
        <Plaque id="catstatue" position={[0, 0.34, -H + 1.62]} />
      </group>
    </group>
  )
}

// After "take me beyond": on the about wall, Le Chat Noir hangs where
// nothing hung before — and below it a real cat sleeps with one
// envelope tucked under its paw. Rendered inside WallGroup j=1.
export function CatAndMail({ P }) {
  const cat = useRef()
  const zone = useRef()
  const openPopup = useStore((s) => s.openPopup)
  // the cat guards the mail: clicking any of it opens the letter
  const handlers = useWiggle(zone, { onClick: () => openPopup('letter', 'thankyou'), axis: 'z' })
  const tex = useArtTexture('chatnoir', { mode: P.name === 'beyond' ? 'beyond' : 'beige' })

  useFrame((state) => {
    // the cat breathes
    if (cat.current) {
      const b = 1 + Math.sin(state.clock.elapsedTime * 1.1) * 0.02
      cat.current.scale.set(1, b, 1)
    }
  })

  return (
    <group position={[0.85, 0, 0]}>
      <group ref={zone} {...handlers}>
        {/* a normal painting, hung like nothing happened */}
        <group position={[0, -4.3, -H + 0.1]}>
          <mesh castShadow>
            <boxGeometry args={[1.6, 2.06, 0.09]} />
            <meshStandardMaterial color={P.frame} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0, 0.052]}>
            <planeGeometry args={[1.4, 1.86]} />
            {tex ? (
              <meshStandardMaterial map={tex} roughness={0.9} />
            ) : (
              <meshStandardMaterial color={P.canvas} roughness={0.9} />
            )}
          </mesh>
        </group>
        {/* the sleeping cat below it */}
        <group ref={cat} position={[0, -H + 0.32, -H + 1.0]}>
          <Roughen amt={0.02} seed={31}>
            <mesh castShadow>
              <sphereGeometry args={[0.34, 14, 10]} />
              <meshStandardMaterial color="#6b5d68" roughness={0.95} flatShading />
            </mesh>
            <mesh position={[0.3, 0.05, 0.05]} castShadow>
              <sphereGeometry args={[0.2, 12, 9]} />
              <meshStandardMaterial color="#6b5d68" roughness={0.95} flatShading />
            </mesh>
            {[-0.07, 0.07].map((x, i) => (
              <mesh key={i} position={[0.34 + x, 0.22, 0.05]} rotation-z={x * 3}>
                <coneGeometry args={[0.05, 0.1, 4]} />
                <meshStandardMaterial color="#5c4f59" roughness={0.95} flatShading />
              </mesh>
            ))}
            <mesh position={[-0.2, -0.1, 0.2]} rotation-x={Math.PI / 2} rotation-z={0.6}>
              <torusGeometry args={[0.22, 0.05, 8, 16, Math.PI * 1.3]} />
              <meshStandardMaterial color="#5c4f59" roughness={0.95} flatShading />
            </mesh>
            <mesh position={[0.32, -0.08, 0.28]} castShadow>
              <sphereGeometry args={[0.08, 8, 6]} />
              <meshStandardMaterial color="#75656f" roughness={0.95} flatShading />
            </mesh>
          </Roughen>
        </group>
        {/* the envelope, slightly tucked under the paw */}
        <group position={[0.42, -H + 0.045, -H + 1.32]} rotation-y={-0.4}>
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
    </group>
  )
}
