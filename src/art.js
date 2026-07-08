// The real collection: public-domain masterpieces served from /public/art.
// In the colourless world they hang as old-film sepia; after "beyond"
// they return in their true colours. A subtle canvas-weave bump map
// gives every canvas a slight relief under the gallery spots.

import { useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'
import { drawIcon } from './sketch.js'

// id → file, aspect (w/h), display title, artist
export const CATALOG = {
  starry:   { file: 'starry.jpg',   aspect: 1.26, title: 'The Starry Night',            artist: 'van Gogh, 1889' },
  wave:     { file: 'wave.jpg',     aspect: 1.49, title: 'The Great Wave off Kanagawa', artist: 'Hokusai, c. 1831' },
  scream:   { file: 'scream.jpg',   aspect: 0.78, title: 'The Scream',                  artist: 'Munch, 1893' },
  mona:     { file: 'mona.jpg',     aspect: 0.67, title: 'Mona Lisa',                   artist: 'da Vinci, c. 1506' },
  pearl:    { file: 'pearl.jpg',    aspect: 0.84, title: 'Girl with a Pearl Earring',   artist: 'Vermeer, c. 1665' },
  apples:   { file: 'apples.jpg',   aspect: 1.2,  title: 'The Basket of Apples',        artist: 'Cézanne, c. 1893' },
  letter:   { file: 'letter.jpg',   aspect: 0.67, title: 'Girl Reading a Letter',       artist: 'Vermeer, c. 1657' },
  lilies:   { file: 'lilies.jpg',   aspect: 1.04, title: 'Water Lilies',                artist: 'Monet, 1906' },
  wanderer: { file: 'wanderer.jpg', aspect: 0.78, title: 'Wanderer above the Sea of Fog', artist: 'Friedrich, 1818' },
  swing:    { file: 'swing.jpg',    aspect: 0.78, title: 'The Swing',                   artist: 'Fragonard, 1767' },
  jatte:    { file: 'jatte.jpg',    aspect: 1.5,  title: 'A Sunday on La Grande Jatte', artist: 'Seurat, 1884' },
  vgself:   { file: 'vgself.jpg',   aspect: 0.79, title: 'Self-Portrait',               artist: 'van Gogh, 1889' },
  kiss:     { file: 'kiss.jpg',     aspect: 1.0,  title: 'The Kiss',                    artist: 'Klimt, 1908' },
  whistler: { file: 'whistler.jpg', aspect: 1.12, title: "Whistler's Mother",           artist: 'Whistler, 1871' },
  venus:    { file: 'venus.jpg',    aspect: 1.55, title: 'The Birth of Venus',          artist: 'Botticelli, c. 1485' },
  gothic:   { file: 'gothic.jpg',   aspect: 0.83, title: 'American Gothic',             artist: 'Wood, 1930' },
  chatnoir: { file: 'chatnoir.jpg', aspect: 0.75, title: 'Le Chat Noir',                artist: 'Steinlen, 1896' },
  napoleon: { file: 'napoleon.jpg', aspect: 0.6,  title: 'Napoleon in His Study',       artist: 'David, 1812' },
  sunrise:  { file: 'sunrise.jpg',  aspect: 1.29, title: 'Impression, Sunrise',         artist: 'Monet, 1872' },
  poppies:  { file: 'poppies.jpg',  aspect: 1.31, title: 'Poppy Field',                 artist: 'Monet, 1873' },
  cafeterrace: { file: 'cafeterrace.jpg', aspect: 0.76, title: 'Café Terrace at Night', artist: 'van Gogh, 1888' },
  sunflowers: { file: 'sunflowers.jpg', aspect: 0.79, title: 'Sunflowers',              artist: 'van Gogh, 1888' },
  almond:   { file: 'almond.jpg',   aspect: 1.26, title: 'Almond Blossom',              artist: 'van Gogh, 1890' },
  delft:    { file: 'delft.jpg',    aspect: 1.2,  title: 'View of Delft',               artist: 'Vermeer, c. 1660' },
  temeraire: { file: 'temeraire.jpg', aspect: 1.34, title: 'The Fighting Téméraire',    artist: 'Turner, 1839' },
  nightwatch: { file: 'nightwatch.jpg', aspect: 1.23, title: 'The Night Watch',         artist: 'Rembrandt, 1642' },
}

const cache = new Map()

function makeTexture(img, { mode, icon, seed = 7 }) {
  const W = 768
  const H = Math.round((W * img.naturalHeight) / img.naturalWidth)
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  if (mode === 'beige') {
    // the old-film world: drained, warm, slightly faded
    ctx.filter = 'grayscale(0.92) sepia(0.42) brightness(1.02) contrast(0.92)'
  }
  ctx.drawImage(img, 0, 0, W, H)
  ctx.filter = 'none'
  if (mode === 'beige') {
    // gentle fade toward the paper tone
    ctx.fillStyle = 'rgba(226, 214, 184, 0.14)'
    ctx.fillRect(0, 0, W, H)
  }
  // The coloured icon exists only in the colourless world. When colour
  // returns, the bright things dissolve back into the whole — you
  // mistook them for the whole world, after all.
  if (icon && mode === 'beige') {
    const px = (icon.fs / 100) * Math.min(W, H)
    const s = px / 100
    ctx.save()
    ctx.translate(icon.fx * W - 50 * s, icon.fy * H - 50 * s)
    ctx.scale(s, s)
    drawIcon(ctx, icon.name, icon.accent, '#14100a', seed)
    ctx.restore()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

// Async texture hook: null until the painting is loaded + processed.
export function useArtTexture(artId, { mode = 'beige', icon = null, seed = 7 } = {}) {
  const [tex, setTex] = useState(null)
  useEffect(() => {
    const entry = CATALOG[artId]
    if (!entry) return
    const key = `${artId}|${mode}|${icon ? icon.name + icon.fx : ''}`
    if (cache.has(key)) {
      setTex(cache.get(key))
      return
    }
    let alive = true
    const img = new Image()
    img.onload = () => {
      if (!alive) return
      const t = makeTexture(img, { mode, icon, seed })
      cache.set(key, t)
      setTex(t)
    }
    img.onerror = () => console.error('[art] failed to load', entry.file)
    img.src = `${import.meta.env.BASE_URL}art/${entry.file}`
    return () => { alive = false }
  }, [artId, mode, icon, seed])
  return tex
}

// One shared canvas-weave bump map — the "slight high-poly" relief.
let weaveTex = null
export function getWeaveBump() {
  if (weaveTex) return weaveTex
  const S = 256
  const c = document.createElement('canvas')
  c.width = c.height = S
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, S, S)
  for (let y = 0; y < S; y += 3) {
    ctx.fillStyle = y % 6 ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.13)'
    ctx.fillRect(0, y, S, 1)
  }
  for (let x = 0; x < S; x += 3) {
    ctx.fillStyle = x % 6 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
    ctx.fillRect(x, 0, 1, S)
  }
  // impasto blobs
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},${0.05 + Math.random() * 0.08})`
    ctx.beginPath()
    ctx.arc(Math.random() * S, Math.random() * S, 1 + Math.random() * 3, 0, 7)
    ctx.fill()
  }
  weaveTex = new THREE.CanvasTexture(c)
  weaveTex.wrapS = weaveTex.wrapT = THREE.RepeatWrapping
  weaveTex.repeat.set(3, 3)
  return weaveTex
}

export function useWeaveBump() {
  return useMemo(() => getWeaveBump(), [])
}
