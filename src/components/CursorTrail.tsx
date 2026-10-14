import { useEffect, useRef } from 'react'

/**
 * A glowing ribbon that follows the pointer, tinted with the current era's
 * accent, shedding a few embers when the cursor moves fast. Drawn on a 2D
 * canvas above the world and below the text, with additive blending.
 * Strongest on the first screen; it calms down as the page scrolls on.
 */
type Pt = { x: number; y: number; life: number }
type Ember = { x: number; y: number; vx: number; vy: number; life: number }

const MAX_PTS = 26

export default function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (window.matchMedia('(pointer: coarse)').matches) return // touch: no cursor to follow

    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const pts: Pt[] = []
    const embers: Ember[] = []
    let mouse = { x: -999, y: -999, speed: 0 }
    let last = { x: -999, y: -999 }

    const onMove = (e: PointerEvent) => {
      mouse = { x: e.clientX, y: e.clientY, speed: Math.hypot(e.clientX - last.x, e.clientY - last.y) }
      last = { x: e.clientX, y: e.clientY }
      pts.push({ x: e.clientX, y: e.clientY, life: 1 })
      if (pts.length > MAX_PTS) pts.shift()
      if (mouse.speed > 18 && embers.length < 80) {
        for (let i = 0; i < 2; i++) {
          embers.push({
            x: e.clientX,
            y: e.clientY,
            vx: (Math.random() - 0.5) * 2.4,
            vy: -Math.random() * 1.6 - 0.4,
            life: 1,
          })
        }
      }
    }
    const onLeave = () => (mouse = { x: -999, y: -999, speed: 0 })

    const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff9a4a'
    let color = accent()
    let colorTick = 0

    const draw = () => {
      raf = requestAnimationFrame(draw)
      if (++colorTick % 20 === 0) color = accent()
      // calmer further down the page
      const strength = Math.max(0.35, 1 - window.scrollY / (window.innerHeight * 1.5))
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'

      for (const p of pts) p.life -= 0.045
      while (pts.length && pts[0].life <= 0) pts.shift()

      // ribbon: overlapping strokes, widest + faintest first
      if (pts.length > 2) {
        for (const [width, alpha] of [
          [18, 0.08],
          [8, 0.18],
          [2.2, 0.85],
        ] as const) {
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          for (let i = 1; i < pts.length; i++) {
            const a = pts[i - 1]
            const b = pts[i]
            const t = i / pts.length
            ctx.strokeStyle = color
            ctx.globalAlpha = alpha * t * b.life * strength
            ctx.lineWidth = width * (0.3 + t * 0.7)
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // the head: a soft lens of light under the cursor
      if (mouse.x > -500) {
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120)
        g.addColorStop(0, color)
        g.addColorStop(1, 'transparent')
        ctx.globalAlpha = 0.1 * strength
        ctx.fillStyle = g
        ctx.fillRect(mouse.x - 120, mouse.y - 120, 240, 240)
      }

      // embers
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i]
        e.x += e.vx
        e.y += e.vy
        e.vy += 0.05
        e.life -= 0.022
        if (e.life <= 0) {
          embers.splice(i, 1)
          continue
        }
        ctx.globalAlpha = e.life * strength
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(e.x, e.y, 1.4 * e.life + 0.4, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }
    raf = requestAnimationFrame(draw)
    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="cursor-trail" aria-hidden />
}
