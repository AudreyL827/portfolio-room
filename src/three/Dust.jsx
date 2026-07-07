import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Dust motes drifting in the gallery light — a custom GLSL shader.
// Each point gets a seed; the vertex shader drifts it slowly and the
// fragment shader draws it as a soft round speck.
const vertex = /* glsl */ `
  uniform float uTime;
  attribute float aSeed;
  varying float vFade;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.12 + aSeed * 43.0) * 0.5;
    p.x += sin(uTime * 0.09 + aSeed * 91.0) * 0.4;
    p.z += cos(uTime * 0.07 + aSeed * 57.0) * 0.4;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.5 + aSeed * 3.0) * (7.0 / max(2.5, -mv.z));
    vFade = 0.25 + 0.5 * fract(aSeed * 7.31);
  }
`
const fragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.08, d) * vFade * 0.22;
    gl_FragColor = vec4(uColor, a);
  }
`

export function Dust({ count = 260, color = '#fff6dd' }) {
  const mat = useRef()
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14
      seeds[i] = Math.random()
    }
    return { positions, seeds }
  }, [count])

  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={{ uTime: { value: 0 }, uColor: { value: new THREE.Color(color) } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
