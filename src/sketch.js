// Style D — "Off-Register Marker".
// The coloured icons that live INSIDE the real paintings: a thick wobbly
// kid-marker ink line, with the colour as one flat shape that missed its
// mark, like a bad screen print. Plus the museum plaques and the parquet.

import * as THREE from 'three'

function makeRng(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => ((s = (s * 16807) % 2147483647), (s - 1) / 2147483646)
}

function wobble(pts, jit, r) {
  const out = []
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]]
    const n = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 6))
    for (let k = 0; k < n; k++) {
      const t = k / n
      out.push([
        a[0] + (b[0] - a[0]) * t + (r() - 0.5) * jit,
        a[1] + (b[1] - a[1]) * t + (r() - 0.5) * jit,
      ])
    }
  }
  out.push(pts[pts.length - 1].slice())
  return out
}

function stroke(ctx, pts) {
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length - 1; i++) {
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2)
  }
  ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1])
  ctx.stroke()
}

function ring(cx, cy, rr, n, wob, r) {
  const p = []
  const start = r() * 6.28
  for (let i = 0; i <= n; i++) {
    const a = start + (i / n) * Math.PI * 2
    const rad = rr * (1 + (r() - 0.5) * wob)
    p.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad])
  }
  return p
}

const ICONS = {
  apple: (r) => ({
    strokes: [ring(50, 58, 27, 15, 0.1, r), [[50, 31], [49, 24], [53, 17]], [[53, 19], [63, 12], [66, 20], [55, 24], [53, 19]]],
    fill: { type: 'disc', cx: 50, cy: 58, r: 26 },
  }),
  star: (r) => {
    const p = []
    for (let i = 0; i <= 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5
      const rad = i % 2 ? 15 : 33
      p.push([50 + Math.cos(a) * rad, 52 + Math.sin(a) * rad])
    }
    return { strokes: [p], fill: { type: 'disc', cx: 50, cy: 52, r: 22 } }
  },
  sail: (r) => ({
    strokes: [
      [[50, 12], [50, 74]],
      [[50, 14], [82, 60], [52, 60]],
      [[48, 22], [22, 58], [48, 58]],
      [[16, 74], [84, 74], [74, 90], [26, 90], [16, 74]],
    ],
    fill: { type: 'bar', x1: 58, y1: 26, x2: 62, y2: 56, w: 14 },
  }),
  sun: (r) => {
    const p = []
    for (let t = 0; t < 6.28 * 2.2; t += 0.3) p.push([50 + Math.cos(t) * (4 + t * 4.6), 50 + Math.sin(t) * (4 + t * 4.6)])
    return { strokes: [p], fill: { type: 'disc', cx: 50, cy: 50, r: 26 } }
  },
  question: (r) => ({
    strokes: [[[36, 34], [38, 22], [50, 16], [62, 22], [63, 34], [52, 44], [50, 56]], ring(50, 74, 4, 7, 0.25, r)],
    fill: { type: 'bar', x1: 46, y1: 22, x2: 54, y2: 60, w: 13 },
  }),
  envelope: (r) => ({
    strokes: [
      [[18, 32], [82, 32], [82, 70], [18, 70], [18, 32]],
      [[18, 34], [50, 56], [82, 34]],
    ],
    fill: { type: 'bar', x1: 24, y1: 51, x2: 76, y2: 51, w: 16 },
  }),
}

function fillShape(ctx, f) {
  ctx.beginPath()
  if (f.type === 'disc') ctx.arc(f.cx, f.cy, f.r, 0, 7)
  else {
    const dx = f.x2 - f.x1, dy = f.y2 - f.y1, l = Math.hypot(dx, dy)
    const nx = (-dy / l) * f.w, ny = (dx / l) * f.w
    ctx.moveTo(f.x1 + nx, f.y1 + ny)
    ctx.lineTo(f.x2 + nx, f.y2 + ny)
    ctx.lineTo(f.x2 - nx, f.y2 - ny)
    ctx.lineTo(f.x1 - nx, f.y1 - ny)
    ctx.closePath()
  }
  ctx.fill()
}

// Draw one Style-D icon into a 100x100 box at the current transform.
export function drawIcon(ctx, name, accent, ink, seed = 7) {
  const r = makeRng(seed)
  const icon = ICONS[name](r)
  ctx.save()
  ctx.translate(56, 50)
  ctx.rotate(0.05)
  ctx.translate(-50, -46)
  ctx.fillStyle = accent
  ctx.globalAlpha = 0.88
  fillShape(ctx, icon.fill)
  ctx.restore()
  ctx.globalAlpha = 1
  ctx.strokeStyle = ink
  ctx.lineWidth = 4.2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  icon.strokes.forEach((s) => stroke(ctx, wobble(s, 2.8, r)))
}

// Museum wall label.
export function plaqueTexture(title, sub) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 192
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#efe8d4'
  ctx.fillRect(0, 0, 512, 192)
  ctx.strokeStyle = 'rgba(27,24,18,.4)'
  ctx.lineWidth = 4
  ctx.strokeRect(8, 8, 496, 176)
  ctx.fillStyle = '#1b1812'
  ctx.textAlign = 'center'
  ctx.font = '600 34px Georgia'
  ctx.fillText(title, 256, 84)
  ctx.font = 'italic 26px Georgia'
  ctx.fillStyle = 'rgba(27,24,18,.6)'
  ctx.fillText(sub, 256, 132)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// Herringbone parquet, like the old galleries.
export function floorTexture(planks) {
  const S = 1024
  const c = document.createElement('canvas')
  c.width = c.height = S
  const ctx = c.getContext('2d')
  ctx.fillStyle = planks[1]
  ctx.fillRect(0, 0, S, S)
  const r = makeRng(31)
  const pw = 34, pl = 102
  for (let row = -1; row < S / pw + 2; row++) {
    for (let col = -1; col < S / pl + 2; col++) {
      for (const flip of [0, 1]) {
        ctx.save()
        ctx.translate(col * pl * 1.44 + (flip ? pl * 0.72 : 0), row * pl * 0.72)
        ctx.rotate(flip ? -Math.PI / 4 : Math.PI / 4)
        ctx.fillStyle = planks[Math.floor(r() * planks.length)]
        ctx.fillRect(-pl / 2, -pw / 2, pl - 2, pw - 2)
        ctx.strokeStyle = 'rgba(60,45,25,0.35)'
        ctx.lineWidth = 1.5
        ctx.strokeRect(-pl / 2, -pw / 2, pl - 2, pw - 2)
        for (let g = 0; g < 2; g++) {
          ctx.strokeStyle = 'rgba(90,70,40,0.18)'
          ctx.beginPath()
          ctx.moveTo(-pl / 2 + 6, -6 + g * 10 + r() * 4)
          ctx.lineTo(pl / 2 - 8, -5 + g * 10 + r() * 4)
          ctx.stroke()
        }
        ctx.restore()
      }
    }
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 2)
  tex.anisotropy = 8
  return tex
}
