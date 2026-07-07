import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useStore } from '../store.js'
import { useWiggle } from './hooks.js'
import { Plaque } from './exhibits.jsx'
import { Model } from './Model.jsx'
import { H } from './Room.jsx'

// Museum statues in "poly realism": classical, recognisable forms with
// irregular triangulated facets, like papercraft casts of the David or
// the Winged Victory. Bodies are composed from lathes, capsules and
// spheres; <Roughen> then displaces every vertex with a deterministic
// hash of its position (so shared edges stay welded) and recomputes
// flat normals — smooth primitives become crumpled low-poly marble.
// Only ONE thing in the whole collection is coloured — the fencer's épée.

function lathe(points, segments = 24) {
  return new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), segments)
}

const marble = (P, rough = 0.55) => ({ color: P.statue, flatShading: true, roughness: rough })

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

export function Pedestal({ P, w = 1.3, h = 1.2, children, plaqueId }) {
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
      <group position={[0, h + 0.1, 0]}>{children}</group>
    </group>
  )
}

// Head with neck, hair mass and a hint of a face — shared by all figures.
function Head({ P, bow = 0, turn = 0, scale = 1 }) {
  const m = marble(P)
  const mr = marble(P, 0.85)
  return (
    <group rotation-x={bow} rotation-y={turn} scale={scale}>
      {/* neck */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.09, 0.16, 10]} />
        <meshStandardMaterial {...m} />
      </mesh>
      {/* skull, slightly egg-shaped */}
      <mesh position={[0, 0.08, 0]} scale={[0.85, 1, 0.9]} castShadow>
        <sphereGeometry args={[0.19, 16, 14]} />
        <meshStandardMaterial {...m} />
      </mesh>
      {/* hair mass */}
      <mesh position={[0, 0.15, -0.03]} scale={[0.95, 0.8, 0.95]}>
        <sphereGeometry args={[0.2, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <meshStandardMaterial {...mr} />
      </mesh>
      {/* brow + nose */}
      <mesh position={[0, 0.08, 0.145]} rotation-x={0.25}>
        <boxGeometry args={[0.13, 0.04, 0.06]} />
        <meshStandardMaterial {...m} />
      </mesh>
      <mesh position={[0, 0.02, 0.17]} rotation-x={-0.4}>
        <coneGeometry args={[0.028, 0.09, 5]} />
        <meshStandardMaterial {...m} />
      </mesh>
      {/* chin */}
      <mesh position={[0, -0.06, 0.12]}>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshStandardMaterial {...m} />
      </mesh>
    </group>
  )
}

// Tapered limb: a capsule from `from` toward `to`.
function Limb({ P, from, to, r1 = 0.07 }) {
  const m = marble(P)
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const dir = b.clone().sub(a)
    const len = dir.length()
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
    const pos = a.clone().add(b).multiplyScalar(0.5)
    return { pos, quat, len }
  }, [from, to])
  return (
    <mesh position={pos} quaternion={quat} castShadow>
      <capsuleGeometry args={[r1, Math.max(0.05, len - r1 * 2), 4, 10]} />
      <meshStandardMaterial {...m} />
    </mesh>
  )
}

// A philosopher's bust: chest, shoulders, weathered bearded head.
export function Bust({ pos = [0, 0], P }) {
  const chest = useMemo(
    () =>
      lathe(
        [
          [0.03, 0], [0.36, 0.01], [0.42, 0.07], [0.4, 0.18], [0.3, 0.34], [0.18, 0.44], [0.1, 0.5],
        ],
        26
      ),
    []
  )
  const m = marble(P)
  return (
    <group position={[pos[0], -H, pos[1] - H + 1.5]}>
      <Pedestal P={P} w={0.95} h={1.45}>
        <Roughen amt={0.045} seed={11}>
        {/* chest scaled flatter, like a torso cut */}
        <mesh geometry={chest} scale={[1.45, 1.3, 0.95]} castShadow>
          <meshStandardMaterial {...m} />
        </mesh>
        {/* shoulders */}
        <mesh position={[0, 0.44, 0]} scale={[1.6, 0.55, 0.9]} castShadow>
          <sphereGeometry args={[0.34, 16, 12]} />
          <meshStandardMaterial {...m} />
        </mesh>
        <group position={[0, 0.78, 0.02]}>
          <Head P={P} turn={0.35} scale={1.45} />
          {/* beard */}
          <mesh position={[0, -0.16, 0.19]} rotation-x={0.45}>
            <coneGeometry args={[0.13, 0.32, 10]} />
            <meshStandardMaterial {...marble(P, 0.85)} />
          </mesh>
        </group>
        </Roughen>
      </Pedestal>
    </group>
  )
}

// A seated muse, head bowed over folded hands — all drapery below the waist.
export function SeatedMuse({ pos = [0, 0], rot = 0, P }) {
  const gown = useMemo(
    () =>
      lathe(
        [
          [0.03, 0], [0.6, 0.01], [0.64, 0.1], [0.52, 0.4], [0.38, 0.7], [0.3, 0.88], [0.26, 0.98],
        ],
        26
      ),
    []
  )
  const m = marble(P)
  return (
    <group position={[pos[0], -H, pos[1] - H + 2.1]} rotation-y={rot}>
      <Pedestal P={P} w={1.5} h={0.55}>
        <Roughen amt={0.05} seed={12}>
        <group>
          {/* skirt, slightly deeper than wide */}
          <mesh geometry={gown} scale={[1, 1, 1.15]} castShadow>
            <meshStandardMaterial {...m} />
          </mesh>
          {/* thighs under the cloth, reaching forward */}
          <Limb P={P} from={[0.16, 0.92, 0.05]} to={[0.2, 0.82, 0.62]} r1={0.14} />
          <Limb P={P} from={[-0.16, 0.92, 0.05]} to={[-0.2, 0.82, 0.62]} r1={0.14} />
          {/* shins dropping to the base */}
          <Limb P={P} from={[0.2, 0.8, 0.66]} to={[0.18, 0.06, 0.72]} r1={0.09} />
          <Limb P={P} from={[-0.2, 0.8, 0.66]} to={[-0.18, 0.06, 0.72]} r1={0.09} />
          {/* torso leaning forward */}
          <group position={[0, 1.22, 0.06]} rotation-x={0.32}>
            <mesh castShadow>
              <capsuleGeometry args={[0.19, 0.4, 4, 14]} />
              <meshStandardMaterial {...m} />
            </mesh>
            {/* shoulders */}
            <mesh position={[0, 0.24, 0]} scale={[1.6, 0.5, 0.8]}>
              <sphereGeometry args={[0.2, 14, 10]} />
              <meshStandardMaterial {...m} />
            </mesh>
            <group position={[0, 0.46, 0.05]}>
              <Head P={P} bow={0.55} />
            </group>
          </group>
          {/* arms folded down to the knees */}
          <Limb P={P} from={[0.3, 1.42, 0.1]} to={[0.26, 1.05, 0.42]} r1={0.065} />
          <Limb P={P} from={[0.26, 1.05, 0.42]} to={[0.1, 0.92, 0.6]} r1={0.055} />
          <Limb P={P} from={[-0.3, 1.42, 0.1]} to={[-0.26, 1.02, 0.4]} r1={0.065} />
          <Limb P={P} from={[-0.26, 1.02, 0.4]} to={[-0.06, 0.9, 0.58]} r1={0.055} />
        </group>
        </Roughen>
      </Pedestal>
    </group>
  )
}

// A standing draped figure with the broken arms of an excavated antique.
export function StandingFigure({ pos = [0, 0], rot = 0, P }) {
  const body = useMemo(
    () =>
      lathe(
        [
          [0.03, 0], [0.46, 0.01], [0.5, 0.06], [0.36, 0.3], [0.3, 0.7], [0.27, 1.05],
          [0.3, 1.25], [0.26, 1.45], [0.21, 1.6],
        ],
        28
      ),
    []
  )
  const m = marble(P)
  return (
    <group position={[pos[0], -H, pos[1] - H + 1.7]} rotation-y={rot}>
      <Pedestal P={P} w={1.15} h={0.9}>
        <Roughen amt={0.05} seed={13}>
        {/* gown, flatter in profile */}
        <mesh geometry={body} scale={[1, 1, 0.8]} castShadow>
          <meshStandardMaterial {...m} />
        </mesh>
        {/* chest */}
        <mesh position={[0, 1.62, 0]} scale={[1, 1.15, 0.75]} castShadow>
          <sphereGeometry args={[0.24, 16, 12]} />
          <meshStandardMaterial {...m} />
        </mesh>
        {/* shoulders */}
        <mesh position={[0, 1.78, 0]} scale={[1.55, 0.45, 0.8]} castShadow>
          <sphereGeometry args={[0.24, 14, 10]} />
          <meshStandardMaterial {...m} />
        </mesh>
        <group position={[0, 2.0, 0.02]}>
          <Head P={P} turn={-0.35} bow={0.06} />
        </group>
        {/* broken arm stubs, angled down */}
        <Limb P={P} from={[0.34, 1.74, 0]} to={[0.44, 1.5, 0.08]} r1={0.07} />
        <Limb P={P} from={[-0.34, 1.74, 0]} to={[-0.42, 1.56, 0.04]} r1={0.07} />
        </Roughen>
      </Pedestal>
    </group>
  )
}

// A statue from a real scanned sculpture (optimized GLB), placed on a
// museum pedestal and recast as faceted marble.
export function GlbStatue({ url, pos = [0, 0], rot = 0, height = 2.1, mirror = false, pedestal = { w: 1.2, h: 0.9 }, preRotate = [0, 0, 0], P }) {
  return (
    <group position={[pos[0], -H, pos[1] - H + 1.7]} rotation-y={rot}>
      <Pedestal P={P} w={pedestal.w} h={pedestal.h}>
        <group scale={[mirror ? -1 : 1, 1, 1]}>
          <Suspense fallback={null}>
            <Model url={url} height={height} preRotate={preRotate} anchor="floor" marble={P.statue} />
          </Suspense>
        </group>
      </Pedestal>
    </group>
  )
}

// The gallery cat: a small marble cat, asleep on a low plinth. It looks
// like decoration. It is not. (The click behaviour lives in story.jsx —
// this is just the sculpture.)
export function CatStatueFigure({ P }) {
  const haunches = useMemo(
    () => lathe([[0.02, 0], [0.3, 0.01], [0.34, 0.1], [0.26, 0.34], [0.17, 0.5]], 20),
    []
  )
  const m = marble(P)
  return (
    <Roughen amt={0.028} seed={21}>
      <group>
        {/* haunches, deeper than wide */}
        <mesh geometry={haunches} scale={[1, 1, 1.25]} castShadow>
          <meshStandardMaterial {...m} />
        </mesh>
        {/* chest, upright */}
        <mesh position={[0, 0.5, 0.14]} rotation-x={-0.12} castShadow>
          <capsuleGeometry args={[0.14, 0.3, 4, 12]} />
          <meshStandardMaterial {...m} />
        </mesh>
        {/* front legs */}
        <mesh position={[0.07, 0.28, 0.24]} castShadow>
          <capsuleGeometry args={[0.045, 0.36, 4, 8]} />
          <meshStandardMaterial {...m} />
        </mesh>
        <mesh position={[-0.07, 0.28, 0.24]} castShadow>
          <capsuleGeometry args={[0.045, 0.36, 4, 8]} />
          <meshStandardMaterial {...m} />
        </mesh>
        {/* head, chin tucked in sleep */}
        <group position={[0, 0.78, 0.18]} rotation-x={0.3}>
          <mesh castShadow>
            <sphereGeometry args={[0.15, 14, 12]} />
            <meshStandardMaterial {...m} />
          </mesh>
          <mesh position={[0, -0.03, 0.12]}>
            <sphereGeometry args={[0.07, 10, 8]} />
            <meshStandardMaterial {...m} />
          </mesh>
          {[-0.08, 0.08].map((x, i) => (
            <mesh key={i} position={[x, 0.13, 0]} rotation-z={x * 4}>
              <coneGeometry args={[0.045, 0.11, 4]} />
              <meshStandardMaterial {...m} />
            </mesh>
          ))}
        </group>
        {/* tail wrapped around the front */}
        <mesh position={[0.14, 0.06, 0.22]} rotation-x={Math.PI / 2} rotation-z={-0.5}>
          <torusGeometry args={[0.2, 0.045, 8, 16, Math.PI * 1.4]} />
          <meshStandardMaterial {...m} />
        </mesh>
      </group>
    </Roughen>
  )
}

// The fencer — the one statue that owns a coloured thing. En garde,
// masked, épée raised: the sword is painted slightly off its own
// geometry, like the colour missed. Clicking it opens your story.
export function FencerStatue({ pos = [0, 0], accent = '#efd53c', P }) {
  const ref = useRef()
  const openPopup = useStore((s) => s.openPopup)
  const handlers = useWiggle(ref, { onClick: () => openPopup('marble', 'fencing'), axis: 'y' })
  const m = marble(P)

  const legs = useMemo(
    () =>
      lathe(
        [
          [0.03, 0], [0.42, 0.01], [0.46, 0.06], [0.34, 0.3], [0.28, 0.7], [0.26, 1.0],
        ],
        24
      ),
    []
  )

  return (
    <group position={[pos[0], -H, pos[1] - H + 1.9]}>
      <Pedestal P={P} w={1.4} h={1.1} plaqueId="fencing">
        <group ref={ref} {...handlers}>
          <Roughen amt={0.045} seed={14}>
          {/* breeches / lower body */}
          <mesh geometry={legs} scale={[1, 1, 0.85]} castShadow>
            <meshStandardMaterial {...m} />
          </mesh>
          {/* torso in profile stance */}
          <group position={[0, 1.18, 0]} rotation-y={0.5}>
            <mesh scale={[1, 1.25, 0.72]} castShadow>
              <sphereGeometry args={[0.26, 16, 12]} />
              <meshStandardMaterial {...m} />
            </mesh>
            <mesh position={[0, 0.28, 0]} scale={[1.5, 0.45, 0.75]} castShadow>
              <sphereGeometry args={[0.25, 14, 10]} />
              <meshStandardMaterial {...m} />
            </mesh>
          </group>
          {/* masked head */}
          <group position={[0, 1.72, 0.03]}>
            <Head P={P} turn={0.5} scale={1.05} />
            {/* the mesh mask */}
            <mesh position={[0.09, 0.05, 0.12]} rotation-y={0.5} rotation-x={0.1} scale={[0.85, 1.1, 1]}>
              <sphereGeometry args={[0.17, 12, 9, 0, Math.PI]} />
              <meshStandardMaterial {...marble(P, 0.9)} />
            </mesh>
          </group>
          {/* rear arm folded up behind, fencer style */}
          <Limb P={P} from={[-0.3, 1.5, -0.05]} to={[-0.48, 1.2, -0.2]} r1={0.075} />
          <Limb P={P} from={[-0.48, 1.2, -0.2]} to={[-0.4, 1.45, -0.38]} r1={0.06} />
          {/* sword arm extended */}
          <Limb P={P} from={[0.3, 1.5, 0.08]} to={[0.66, 1.62, 0.3]} r1={0.075} />
          <Limb P={P} from={[0.66, 1.62, 0.3]} to={[0.98, 1.78, 0.42]} r1={0.06} />
          </Roughen>
          {/* THE coloured épée, deliberately off-register: blade extends
              forward from the hand, bell guard at the fist */}
          <group position={[1.0, 1.8, 0.44]} rotation-z={-1.25} rotation-y={0.28}>
            <group position={[0.04, 0.03, 0.02]} rotation-z={0.06}>
              {/* blade: hand at y=0, tip at y=1.2 */}
              <mesh position={[0, 0.6, 0]} castShadow>
                <cylinderGeometry args={[0.009, 0.022, 1.2, 8]} />
                <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} roughness={0.4} />
              </mesh>
              {/* bell guard over the fist, opening toward the tip */}
              <mesh position={[0, 0.1, 0]}>
                <sphereGeometry args={[0.11, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.25} roughness={0.4} />
              </mesh>
              {/* grip behind the guard */}
              <mesh position={[0, -0.08, 0]}>
                <cylinderGeometry args={[0.02, 0.025, 0.16, 6]} />
                <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.2} roughness={0.5} />
              </mesh>
            </group>
          </group>
        </group>
      </Pedestal>
    </group>
  )
}
