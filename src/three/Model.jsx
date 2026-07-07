import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

// Loads an optimized GLB from /public/models and tames it for the room:
// re-orients it, scales it to a target height, drops it onto its base
// (or centres it, for hung paintings), and restyles it for the world —
// marble statues get the faceted-marble override; textured paintings
// get their colours drained to old-film sepia in the beige world.

const setupLoader = (loader) => loader.setMeshoptDecoder(MeshoptDecoder)

const sepiaCache = new Map()
function toSepia(tex, key) {
  if (sepiaCache.has(key)) return sepiaCache.get(key)
  const img = tex.image
  if (!img || !img.width) return tex
  const c = document.createElement('canvas')
  c.width = img.width
  c.height = img.height
  const ctx = c.getContext('2d')
  ctx.filter = 'grayscale(0.92) sepia(0.42) brightness(1.02) contrast(0.92)'
  ctx.drawImage(img, 0, 0)
  ctx.filter = 'none'
  ctx.fillStyle = 'rgba(226, 214, 184, 0.14)'
  ctx.fillRect(0, 0, c.width, c.height)
  const out = new THREE.CanvasTexture(c)
  out.colorSpace = THREE.SRGBColorSpace
  out.flipY = tex.flipY
  out.wrapS = tex.wrapS
  out.wrapT = tex.wrapT
  sepiaCache.set(key, out)
  return out
}

export function Model({
  url,
  height = 2,
  preRotate = [0, 0, 0],   // orient the asset upright before measuring
  anchor = 'floor',        // 'floor' (statues) | 'center' (hung paintings)
  mode = 'beige',
  marble = null,           // colour string → override all materials as faceted marble
  ...props
}) {
  const gltf = useLoader(GLTFLoader, url, setupLoader)

  const object = useMemo(() => {
    const scene = gltf.scene.clone(true)
    // cloned GLTF nodes may have matrixAutoUpdate=false — rotate a fresh
    // wrapper group instead of the scene root, so the transform is real
    const spin = new THREE.Group()
    spin.add(scene)
    spin.rotation.set(...preRotate)
    const wrap = new THREE.Group()
    wrap.add(spin)
    wrap.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(wrap)
    const size = box.getSize(new THREE.Vector3())
    const k = height / (size.y || 1)
    wrap.scale.setScalar(k)
    wrap.updateMatrixWorld(true)
    const box2 = new THREE.Box3().setFromObject(wrap)
    const c = box2.getCenter(new THREE.Vector3())
    if (anchor === 'floor') wrap.position.set(-c.x, -box2.min.y, -c.z)
    else wrap.position.set(-c.x, -c.y, -c.z)

    scene.traverse((o) => {
      if (!o.isMesh) return
      o.castShadow = true
      if (marble) {
        o.material = new THREE.MeshStandardMaterial({ color: marble, flatShading: true, roughness: 0.55 })
      } else {
        o.material = o.material.clone()
        if (mode === 'beige' && o.material.map) {
          o.material.map = toSepia(o.material.map, url + '|' + (o.material.map.uuid ?? o.name))
          o.material.needsUpdate = true
        }
      }
    })
    const outer = new THREE.Group()
    outer.add(wrap)
    return outer
  }, [gltf, height, preRotate, anchor, mode, marble, url])

  return <primitive object={object} {...props} />
}
