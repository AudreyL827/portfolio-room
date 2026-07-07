import { useMemo } from 'react'
import * as THREE from 'three'
import { floorTexture } from '../sketch.js'

export const S = 16          // the room is the inside of a 16m cube — a grand hall
export const H = S / 2

// One of the four walls, with full museum trim: baseboard, wainscot,
// panel mouldings, dentil course, crown.
function Wall({ j, P }) {
  const color = j % 2 ? P.wallAlt : P.wall
  return (
    <group rotation-y={-j * Math.PI * 0.5}>
      <mesh position={[0, 0, -H]} receiveShadow>
        <planeGeometry args={[S, S]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* wainscot panel */}
      <mesh position={[0, -H + 1.2, -H + 0.02]} receiveShadow>
        <planeGeometry args={[S, 2.4]} />
        <meshStandardMaterial color={P.wainscot} roughness={0.9} />
      </mesh>
      {/* wainscot rail */}
      <mesh position={[0, -H + 2.4, -H + 0.06]} castShadow>
        <boxGeometry args={[S, 0.12, 0.14]} />
        <meshStandardMaterial color={P.trim} roughness={0.8} />
      </mesh>
      {/* baseboard */}
      <mesh position={[0, -H + 0.22, -H + 0.05]}>
        <boxGeometry args={[S, 0.44, 0.12]} />
        <meshStandardMaterial color={P.trim} roughness={0.8} />
      </mesh>
      {/* tall panel mouldings behind the paintings */}
      {[-5.2, 0, 5.2].map((x) => (
        <group key={x} position={[x, -1.4, -H + 0.035]}>
          {[
            [0, 4.05, 4.6, 0.09], [0, -4.05, 4.6, 0.09],
          ].map(([px, py, pw, ph], i) => (
            <mesh key={'h' + i} position={[px, py, 0]}>
              <boxGeometry args={[pw, ph, 0.05]} />
              <meshStandardMaterial color={P.trim} roughness={0.85} />
            </mesh>
          ))}
          {[[-2.26, 0], [2.26, 0]].map(([px, py], i) => (
            <mesh key={'v' + i} position={[px, py, 0]}>
              <boxGeometry args={[0.09, 8.2, 0.05]} />
              <meshStandardMaterial color={P.trim} roughness={0.85} />
            </mesh>
          ))}
        </group>
      ))}
      {/* dentil course */}
      {Array.from({ length: 26 }, (_, i) => (
        <mesh key={'d' + i} position={[-H + 0.4 + i * (S / 26), H - 0.85, -H + 0.09]}>
          <boxGeometry args={[0.22, 0.22, 0.14]} />
          <meshStandardMaterial color={P.trim} roughness={0.85} />
        </mesh>
      ))}
      {/* crown moulding, two steps */}
      <mesh position={[0, H - 0.55, -H + 0.1]}>
        <boxGeometry args={[S, 0.34, 0.2]} />
        <meshStandardMaterial color={P.trim} roughness={0.8} />
      </mesh>
      <mesh position={[0, H - 0.22, -H + 0.18]}>
        <boxGeometry args={[S, 0.32, 0.36]} />
        <meshStandardMaterial color={P.trim} roughness={0.8} />
      </mesh>
    </group>
  )
}

// A big coffered glass skylight, like the old national galleries.
function Ceiling({ P }) {
  const G = 10 // skylight span
  const n = 6  // panes per side
  return (
    <group>
      <mesh rotation-x={Math.PI / 2} position={[0, H, 0]}>
        <planeGeometry args={[S, S]} />
        <meshStandardMaterial color={P.ceiling} roughness={1} />
      </mesh>
      {/* glass */}
      <mesh rotation-x={Math.PI / 2} position={[0, H - 0.06, 0]}>
        <planeGeometry args={[G, G]} />
        <meshStandardMaterial color="#dfe8e4" emissive="#f2f0e2" emissiveIntensity={0.55} roughness={0.4} />
      </mesh>
      {/* mullion grid */}
      {Array.from({ length: n + 1 }, (_, i) => {
        const p = -G / 2 + (i * G) / n
        return (
          <group key={i}>
            <mesh position={[p, H - 0.1, 0]}>
              <boxGeometry args={[0.14, 0.14, G]} />
              <meshStandardMaterial color={P.coffer} roughness={0.85} />
            </mesh>
            <mesh position={[0, H - 0.1, p]}>
              <boxGeometry args={[G, 0.14, 0.14]} />
              <meshStandardMaterial color={P.coffer} roughness={0.85} />
            </mesh>
          </group>
        )
      })}
      {/* skylight surround */}
      {[[0, -G / 2 - 0.5], [0, G / 2 + 0.5]].map(([x, z], i) => (
        <mesh key={'sx' + i} position={[x, H - 0.16, z]}>
          <boxGeometry args={[G + 2, 0.32, 1]} />
          <meshStandardMaterial color={P.trim} roughness={0.85} />
        </mesh>
      ))}
      {[[-G / 2 - 0.5, 0], [G / 2 + 0.5, 0]].map(([x, z], i) => (
        <mesh key={'sz' + i} position={[x, H - 0.16, z]}>
          <boxGeometry args={[1, 0.32, G + 2]} />
          <meshStandardMaterial color={P.trim} roughness={0.85} />
        </mesh>
      ))}
      <pointLight position={[0, H - 2, 0]} intensity={26} color="#f6f2e4" decay={1.5} />
    </group>
  )
}

// The chandelier the key hides in — modest, so the skylight stays the star.
function Chandelier({ P }) {
  return (
    <group position={[0, H - 2.4, 0]}>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 2.4, 8]} />
        <meshStandardMaterial color={P.chandelier} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.55, 0.045, 10, 32]} />
        <meshStandardMaterial color={P.chandelier} metalness={0.5} roughness={0.4} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.55, 0.09, Math.sin(a) * 0.55]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color="#fff8e0" emissive="#ffdf9e" emissiveIntensity={2} />
          </mesh>
        )
      })}
      <pointLight intensity={5} color="#ffe0a8" decay={1.8} />
    </group>
  )
}

// Track rails with little spot cans, aimed at each wall (like the
// National Gallery photo), plus the actual SpotLights that do the work.
function WallLighting({ j, P }) {
  const target = useMemo(() => new THREE.Object3D(), [])
  const a = -j * Math.PI * 0.5
  const dx = -Math.sin(a)
  const dz = -Math.cos(a)
  // rail runs parallel to wall j at 3m out from it
  return (
    <group>
      <group rotation-y={a}>
        <mesh position={[0, H - 1.1, -H + 3]}>
          <boxGeometry args={[S * 0.7, 0.09, 0.09]} />
          <meshStandardMaterial color={P.chandelier} roughness={0.5} metalness={0.3} />
        </mesh>
        {[-4, -1.4, 1.4, 4].map((x) => (
          <mesh key={x} position={[x, H - 1.35, -H + 3.15]} rotation-x={0.7}>
            <cylinderGeometry args={[0.07, 0.1, 0.3, 10]} />
            <meshStandardMaterial color={P.chandelier} roughness={0.5} metalness={0.3} />
          </mesh>
        ))}
      </group>
      <spotLight
        position={[dx * (H - 3), H - 1.4, dz * (H - 3)]}
        angle={0.62}
        penumbra={0.65}
        intensity={110}
        decay={1.8}
        color="#fff2da"
        target={target}
        castShadow={j % 2 === 0}
        shadow-mapSize={[1024, 1024]}
      />
      <primitive object={target} position={[dx * (H - 0.4), -3.4, dz * (H - 0.4)]} />
    </group>
  )
}

export function Bench({ P }) {
  return (
    <group>
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[2.8, 0.16, 0.8]} />
        <meshStandardMaterial color={P.bench} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[2.7, 0.08, 0.72]} />
        <meshStandardMaterial color={P.wainscot} roughness={0.95} />
      </mesh>
      {[-1.2, 1.2].map((x) =>
        [-0.3, 0.3].map((z) => (
          <mesh key={x + ':' + z} position={[x, 0.22, z]} castShadow>
            <boxGeometry args={[0.1, 0.44, 0.1]} />
            <meshStandardMaterial color={P.bench} roughness={0.6} />
          </mesh>
        ))
      )}
    </group>
  )
}

export function Room({ P }) {
  const floorMap = useMemo(() => floorTexture(P.plank), [P])
  return (
    <group>
      {[0, 1, 2, 3].map((j) => (
        <Wall key={j} j={j} P={P} />
      ))}
      {/* herringbone floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -H, 0]} receiveShadow>
        <planeGeometry args={[S, S]} />
        <meshStandardMaterial map={floorMap} color="#ffffff" roughness={0.8} />
      </mesh>
      {/* rug */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -H + 0.012, 0]} receiveShadow>
        <circleGeometry args={[3.2, 48]} />
        <meshStandardMaterial color={P.rug} roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -H + 0.013, 0]}>
        <ringGeometry args={[2.95, 3.2, 48]} />
        <meshStandardMaterial color={P.frame} roughness={1} />
      </mesh>
      <Ceiling P={P} />
      <Chandelier P={P} />
      <ambientLight intensity={0.42 * P.lightIntensity} color={P.ambient} />
      <hemisphereLight intensity={0.4} color="#eef0e8" groundColor={P.floor} />
      {[0, 1, 2, 3].map((j) => (
        <WallLighting key={j} j={j} P={P} />
      ))}
      <fog attach="fog" args={[P.fog, 14, 52]} />
    </group>
  )
}
