import { Suspense, useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { useStore } from '../store.js'
import { useWiggle } from './hooks.js'
import { Plaque } from './exhibits.jsx'
import { Model } from './Model.jsx'
import { H } from './Room.jsx'

// The statue collection: real museum scans (Michelangelo's David, Rodin's
// Thinker, the Caracalla bust, plus the scans you imported), decimated to
// irregular low-poly facets and recast in marble. Only ONE thing in the
// whole collection is coloured — the épée, displayed as a relic.

function roughenGeometry(geo, amt, seed) {
  const g = geo.index ? geo.toNonIndexed() : geo
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    // deterministic per-position hash → coincident vertices move together
    const h = (k) => {
      const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed * 7.7 + k * 17.31) * 43758.5453
      return s - Math.floor(s)
    }
    p.setXYZ(i, x + (h(1) - 0.5) * amt * 2, y + (h(2) - 0.5) * amt * 2, z + (h(3) - 0.5) * amt * 2)
  }
  g.computeVertexNormals() // non-indexed → true flat facets
  return g
}

// Wrap a figure: every mesh inside gets the crumpled-marble treatment.
export function Roughen({ amt = 0.05, seed = 3, children }) {
  const ref = useRef()
  useLayoutEffect(() => {
    ref.current?.traverse((o) => {
      if (o.isMesh && !o.userData.roughened) {
        o.geometry = roughenGeometry(o.geometry, amt, seed)
        o.userData.roughened = true
      }
    })
  }, [amt, seed])
  return <group ref={ref}>{children}</group>
}

export function Pedestal({ P, w = 1.3, h = 1.2, children, plaqueId, plaqueTitle, plaqueSub }) {
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, w]} />
        <meshStandardMaterial color={P.pedestal} roughness={0.85} />
      </mesh>
      <mesh position={[0, h + 0.05, 0]} castShadow>
        <boxGeometry args={[w + 0.18, 0.1, w + 0.18]} />
        <meshStandardMaterial color={P.trim} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[w + 0.22, 0.12, w + 0.22]} />
        <meshStandardMaterial color={P.trim} roughness={0.8} />
      </mesh>
      {plaqueId && <Plaque id={plaqueId} position={[0, h * 0.55, w / 2 + 0.01]} />}
      {plaqueTitle && <Plaque title={plaqueTitle} sub={plaqueSub} position={[0, h * 0.55, w / 2 + 0.01]} />}
      <group position={[0, h + 0.1, 0]}>{children}</group>
    </group>
  )
}

// A statue from a real scan, on a museum pedestal, recast as faceted marble.
export function GlbStatue({
  url, pos = [0, 0], rot = 0, height = 2.1, mirror = false,
  pedestal = { w: 1.2, h: 0.9 }, preRotate = [0, 0, 0],
  title, sub, P,
}) {
  return (
    <group position={[pos[0], -H, pos[1] - H + 1.7]} rotation-y={rot}>
      <Pedestal P={P} w={pedestal.w} h={pedestal.h} plaqueTitle={title} plaqueSub={sub}>
        <group scale={[mirror ? -1 : 1, 1, 1]}>
          <Suspense fallback={null}>
            <Model url={url} height={height} preRotate={preRotate} anchor="floor" marble={P.statue} />
          </Suspense>
        </group>
      </Pedestal>
    </group>
  )
}

// The one coloured thing in the collection: your épée, displayed like a
// relic on its own stand — blade angled on two marble prongs. Clicking
// it opens the fencing story.
export function EpeeRelic({ pos = [0, 0], accent = '#efd53c', P }) {
  const ref = useRef()
  const openPopup = useStore((s) => s.openPopup)
  const handlers = useWiggle(ref, { onClick: () => openPopup('marble', 'fencing'), axis: 'z' })
  const prong = (
    <>
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.045, 0.3, 8]} />
        <meshStandardMaterial color={P.statue} flatShading roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation-z={Math.PI / 2} castShadow>
        <torusGeometry args={[0.05, 0.018, 6, 12, Math.PI]} />
        <meshStandardMaterial color={P.statue} flatShading roughness={0.55} />
      </mesh>
    </>
  )
  return (
    <group position={[pos[0], -H, pos[1] - H + 1.7]}>
      <Pedestal P={P} w={1.5} h={1.05} plaqueId="fencing">
        <group ref={ref} {...handlers}>
          {/* two prongs cradle the blade */}
          <group position={[-0.42, 0, 0]}>{prong}</group>
          <group position={[0.42, 0, 0]}>{prong}</group>
          {/* THE coloured épée, resting at a slight angle, off-register */}
          <group position={[0.03, 0.4, 0.02]} rotation-z={Math.PI / 2 - 0.08}>
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.01, 0.024, 1.15, 8]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.32, 0]}>
              <sphereGeometry args={[0.11, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.25} roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.45, 0]}>
              <cylinderGeometry args={[0.02, 0.026, 0.2, 6]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.2} roughness={0.5} />
            </mesh>
          </group>
        </group>
      </Pedestal>
    </group>
  )
}
