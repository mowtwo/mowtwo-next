import { useEffect, useRef, useState } from 'react'

type Props = { onDone: () => void }

const DURATION = 4200 // ms — unhurried, so the decode can be watched
const NOISE = '01/\\|-+*<>=?:;%'
const SHELL = '#%&@$8'
const BOOT_LINES = ['boot m2.core', 'cast iron frame', 'wind the escapement', 'route the circuits', 'wake the network', 'ready']

const hash = (x: number, y: number) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}
const easeOut = (x: number) => 1 - Math.pow(1 - x, 2.2)

/** sample the mask SVG into a grid: 0 empty, 1 shell, 2 eye */
async function sampleMask(cols: number, rows: number): Promise<Uint8Array> {
  const img = new Image()
  img.src = '/brand/m2-mask.svg'
  await img.decode()
  const c = document.createElement('canvas')
  c.width = cols
  c.height = rows
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, 0, 0, cols, rows)
  const d = ctx.getImageData(0, 0, cols, rows).data
  const out = new Uint8Array(cols * rows)
  for (let i = 0; i < cols * rows; i++) {
    const a = d[i * 4 + 3]
    if (a < 90) continue
    const r = d[i * 4]
    out[i] = r < 160 ? 2 : 1 // the cyan eyes have a low red channel
  }
  return out
}

/**
 * Boot sequence. The mask decodes out of ASCII noise, bottom to top, inside a
 * gear ring that fills with progress; prism rays refract out of the ring, sparks
 * fly off the progress head, satellites orbit. At 100 the ring blooms open.
 */
export default function Preloader({ onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [count, setCount] = useState(0)
  const [boot, setBoot] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const progRef = useRef(0)
  const leaveRef = useRef(0) // 0..1 exit bloom

  // progress clock with small irregular stalls so it doesn't feel linear
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const stalls = [0.2, 0.46, 0.71, 0.88]
    let leaveStart = 0
    const tick = (now: number) => {
      const raw = Math.min(1, (now - start) / DURATION)
      let p = easeOut(raw)
      for (const s of stalls) if (raw > s - 0.04 && raw < s + 0.04) p -= 0.025 * Math.sin((raw - s) * 40)
      p = Math.max(0, Math.min(1, p))
      progRef.current = p
      setCount(Math.round(p * 100))
      setBoot(Math.min(BOOT_LINES.length - 1, Math.floor(p * BOOT_LINES.length)))
      if (raw < 1) {
        raf = requestAnimationFrame(tick)
        return
      }
      if (!leaveStart) {
        leaveStart = now
        setLeaving(true)
      }
      leaveRef.current = Math.min(1, (now - leaveStart) / 900)
      if (leaveRef.current < 1) raf = requestAnimationFrame(tick)
      else onDone()
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    let raf = 0
    let alive = true
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const CELL = 9
    let mask: Uint8Array | null = null
    let cols = 0
    let rows = 0
    const R0 = () => Math.min(w, h) * 0.24
    const boxSize = () => R0() * 1.42
    cols = Math.floor(boxSize() / CELL)
    rows = cols
    sampleMask(cols, rows).then((m) => alive && (mask = m)).catch(() => undefined)

    type Spark = { x: number; y: number; vx: number; vy: number; life: number }
    const sparks: Spark[] = []
    const start = performance.now()
    const CY = () => h * 0.46

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw)
      const t = (now - start) / 1000
      const p = progRef.current
      const out = leaveRef.current
      const cx = w / 2
      const cy = CY()
      const R = R0() * (1 + out * 0.7)
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      const fade = 1 - out

      // ---- ASCII mask decoding bottom → top
      const box = cols * CELL
      ctx.font = `700 ${CELL}px 'JetBrains Mono', monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const scanRow = rows * (1 - p * 1.05)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = cx - box / 2 + c * CELL + CELL / 2
          const y = cy - box / 2 + r * CELL + CELL / 2
          const dx = (x - cx) / (box / 2)
          const dy = (y - cy) / (box / 2)
          if (dx * dx + dy * dy > 1.05) continue
          const kind = mask ? mask[r * cols + c] : 0
          const hh = hash(c, r)
          const resolved = r > scanRow + hh * 3
          if (resolved && kind) {
            const ch = kind === 2 ? '=' : SHELL[Math.floor(hh * SHELL.length)]
            ctx.fillStyle = kind === 2 ? `rgba(160,245,255,${0.95 * fade})` : `rgba(56,217,255,${(0.42 + hh * 0.3) * fade})`
            ctx.fillText(ch, x, y)
          } else if (!resolved || hh > 0.93) {
            // noise: flickering glyphs, brightest right at the scan line
            const near = Math.max(0, 1 - Math.abs(r - scanRow) / 3)
            const flick = hash(c + Math.floor(t * 12), r)
            if (!resolved && flick < 0.55 - near * 0.3) continue
            const ch = NOISE[Math.floor(flick * NOISE.length)]
            ctx.fillStyle = `rgba(56,217,255,${(0.06 + near * 0.75) * fade})`
            ctx.fillText(ch, x, y)
          }
        }
      }

      // ---- gear ring: teeth turn slowly; the progress arc fills
      ctx.lineCap = 'round'
      const teeth = 48
      ctx.beginPath()
      for (let i = 0; i < teeth; i++) {
        const a0 = (i / teeth) * Math.PI * 2 + t * 0.15
        const a1 = a0 + (Math.PI * 2) / teeth / 2
        ctx.arc(cx, cy, R + 14, a0, a1)
        ctx.lineTo(cx + Math.cos(a1) * (R + 20), cy + Math.sin(a1) * (R + 20))
        ctx.arc(cx, cy, R + 20, a1, a1 + (Math.PI * 2) / teeth / 2)
        ctx.lineTo(cx + Math.cos(a1 + (Math.PI * 2) / teeth / 2) * (R + 14), cy + Math.sin(a1 + (Math.PI * 2) / teeth / 2) * (R + 14))
      }
      ctx.strokeStyle = `rgba(56,217,255,${0.22 * fade})`
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx, cy, R + 4, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(56,217,255,${0.12 * fade})`
      ctx.stroke()
      const a0 = -Math.PI / 2
      const aHead = a0 + p * Math.PI * 2
      ctx.beginPath()
      ctx.arc(cx, cy, R + 4, a0, aHead)
      ctx.strokeStyle = `rgba(120,235,255,${0.9 * fade})`
      ctx.lineWidth = 2
      ctx.shadowColor = 'rgba(56,217,255,0.9)'
      ctx.shadowBlur = 12
      ctx.stroke()
      ctx.shadowBlur = 0

      // fine ticks light up as the head passes
      for (let i = 0; i < 120; i++) {
        const a = a0 + (i / 120) * Math.PI * 2
        const on = a <= aHead
        const len = i % 10 === 0 ? 9 : 4
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(a) * (R + 28), cy + Math.sin(a) * (R + 28))
        ctx.lineTo(cx + Math.cos(a) * (R + 28 + len), cy + Math.sin(a) * (R + 28 + len))
        ctx.strokeStyle = on ? `rgba(120,235,255,${0.7 * fade})` : `rgba(56,217,255,${0.1 * fade})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // ---- refraction: prism rays split into R/G/B, plus lens ghosts along one axis
      const RAYS = 18
      const spectrum = ['255,70,90', '90,255,170', '80,150,255']
      for (let i = 0; i < RAYS; i++) {
        const grow = Math.min(1, Math.max(0, p * 1.5 - hash(i, 3) * 0.5))
        if (grow <= 0.01) continue
        const base = (i / RAYS) * Math.PI * 2 + t * 0.06 + hash(i, 9) * 0.2
        const len = R * (0.55 + hash(i, 5) * 0.9) * grow * (1 + out * 1.6)
        const width = 0.012 + hash(i, 11) * 0.02 // angular half-width of the shaft
        const flick = 0.55 + 0.45 * Math.sin(t * (1.5 + hash(i, 2) * 3) + i)
        for (let k = 0; k < 3; k++) {
          // each colour leaves the prism at a slightly different angle and length
          const a = base + (k - 1) * 0.012 * (1 + out)
          const r0 = R + 36
          const r1 = r0 + len * (1 - k * 0.08)
          const grad = ctx.createLinearGradient(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1)
          grad.addColorStop(0, `rgba(${spectrum[k]},${0.32 * flick * fade})`)
          grad.addColorStop(1, `rgba(${spectrum[k]},0)`)
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.moveTo(cx + Math.cos(a - width * 0.3) * r0, cy + Math.sin(a - width * 0.3) * r0)
          ctx.lineTo(cx + Math.cos(a - width) * r1, cy + Math.sin(a - width) * r1)
          ctx.lineTo(cx + Math.cos(a + width) * r1, cy + Math.sin(a + width) * r1)
          ctx.lineTo(cx + Math.cos(a + width * 0.3) * r0, cy + Math.sin(a + width * 0.3) * r0)
          ctx.closePath()
          ctx.fill()
        }
      }
      // lens ghosts: discs and rings strung along a slowly turning axis through the centre
      const axis = -0.7 + Math.sin(t * 0.2) * 0.15
      const ghosts: [number, number, string, boolean][] = [
        [-1.6, 26, '80,150,255', false],
        [-0.9, 10, '255,70,90', true],
        [0.75, 40, '90,255,170', true],
        [1.35, 16, '255,200,120', false],
        [1.9, 60, '120,200,255', true],
      ]
      for (const [d, size, rgb, ring] of ghosts) {
        const gx = cx + Math.cos(axis) * R * d
        const gy = cy + Math.sin(axis) * R * d
        const alpha = 0.16 * Math.min(1, p * 2) * fade
        if (ring) {
          ctx.beginPath()
          ctx.arc(gx, gy, size, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${rgb},${alpha})`
          ctx.lineWidth = 1.5
          ctx.stroke()
        } else {
          const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, size)
          g.addColorStop(0, `rgba(${rgb},${alpha * 1.6})`)
          g.addColorStop(1, `rgba(${rgb},0)`)
          ctx.fillStyle = g
          ctx.fillRect(gx - size, gy - size, size * 2, size * 2)
        }
      }

      // ---- satellites with short trails
      for (let i = 0; i < 3; i++) {
        const rr = R + 70 + i * 26
        const sp = 0.5 + i * 0.22
        for (let k = 0; k < 14; k++) {
          const a = t * sp * (i % 2 ? -1 : 1) + i * 2 - k * 0.03 * (i % 2 ? -1 : 1)
          ctx.beginPath()
          ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 1.8 - k * 0.11, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(160,245,255,${(1 - k / 14) * 0.8 * fade * Math.min(1, p * 3)})`
          ctx.fill()
        }
      }

      // ---- sparks thrown off the progress head
      if (p < 1 && Math.random() < 0.6) {
        const hx = cx + Math.cos(aHead) * (R + 4)
        const hy = cy + Math.sin(aHead) * (R + 4)
        for (let k = 0; k < 2; k++) {
          const a = aHead + Math.PI / 2 + (Math.random() - 0.5) * 1.6
          const s = 1 + Math.random() * 2.5
          sparks.push({ x: hx, y: hy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1 })
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.x += s.vx
        s.y += s.vy
        s.vy += 0.04
        s.life -= 0.03
        if (s.life <= 0) {
          sparks.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x - s.vx * 3, s.y - s.vy * 3)
        ctx.strokeStyle = `rgba(200,250,255,${s.life * fade})`
        ctx.lineWidth = 1.2
        ctx.stroke()
      }

      // ---- exit flash
      if (out > 0) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2)
        g.addColorStop(0, `rgba(200,250,255,${Math.sin(out * Math.PI) * 0.35})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      }
      ctx.globalCompositeOperation = 'source-over'
    }
    raf = requestAnimationFrame(draw)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className={`preloader ${leaving ? 'leaving' : ''}`}>
      <canvas ref={canvasRef} />
      <div className="preloader-meta">
        <div className="preloader-count">{String(count).padStart(3, '0')}</div>
        <div className="preloader-boot">
          {BOOT_LINES[boot]}
          <span className="caret">_</span>
        </div>
      </div>
    </div>
  )
}
