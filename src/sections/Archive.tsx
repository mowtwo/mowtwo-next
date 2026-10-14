import { useEffect, useMemo, useRef, useState } from 'react'
import { categories, projects, type CategoryKey, type Project } from '../data/content'
import { useLocale } from '../i18n/context'

type Filter = CategoryKey | 'all'

const CAT_HUE: Record<CategoryKey, string> = {
  products: '#5fe6ff',
  ai: '#b98aff',
  lang: '#39ffb0',
  lab: '#ffb347',
  tools: '#ff7a8a',
}

/** helix slots kept in the DOM; slot k shows list[k mod n], so the staircase never ends */
const SLOTS = 15
const HALF = Math.floor(SLOTS / 2)
const OUT_MS = 720 // old set spirals up and away …
const IN_MS = 900 // … then the new set spirals in from below

const ease = (x: number) => x * x * (3 - 2 * x)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const listFor = (f: Filter) => (f === 'all' ? projects : projects.filter((p) => p.category === f))

/**
 * Act V — the orbit. Cards stand on an endless helix (CSS 3D) — a spiral
 * staircase around the mechanical spine drawn in WebGL behind. A fixed pool of
 * slots is recycled as you climb: slot k shows item k mod n, so even a
 * two-project category fills the staircase. Scrolling through the act climbs;
 * horizontal drag turns. Changing category plays in two beats: the current set
 * spirals up and vanishes, then the new set spirals in from below.
 */
export default function Archive({ onOpen }: { onOpen: (p: Project) => void }) {
  const { t } = useLocale()
  const [filter, setFilter] = useState<Filter>('all') // what the visitor picked
  const [shown, setShown] = useState<Filter>('all') // what the helix currently carries
  const [base, setBase] = useState(-HALF) // helix index of slot 0
  const list = useMemo(() => listFor(shown), [shown])

  const ringRef = useRef<HTMLDivElement>(null)
  const slotRefs = useRef<(HTMLButtonElement | null)[]>([])
  const drag = useRef({ on: false, x: 0, offset: 0, vel: 0, moved: 0 })
  const cursor = useRef(0)
  const baseRef = useRef(base)
  const filterRef = useRef(filter)
  // transition clock: 'out' → swap → 'in' → idle
  const phase = useRef<{ kind: 'idle' | 'out' | 'in'; start: number }>({ kind: 'in', start: 0 })

  useEffect(() => {
    baseRef.current = base
  }, [base])

  // a new pick starts the two-beat transition; the swap happens when 'out' ends
  useEffect(() => {
    filterRef.current = filter
    if (filter !== shown && phase.current.kind !== 'out') phase.current = { kind: 'out', start: performance.now() }
  }, [filter, shown])

  useEffect(() => {
    let raf = 0
    const section = ringRef.current?.closest<HTMLElement>('[data-act]')
    let inside = false
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const ring = ringRef.current
      if (!ring || !section) return
      const now = performance.now()
      const l = parseFloat(section.style.getPropertyValue('--l') || '0')
      // arriving at the act spirals the current set in from below
      const nowInside = l > -0.12 && l < 1.08
      if (nowInside && !inside && phase.current.kind !== 'out') phase.current = { kind: 'in', start: now }
      inside = nowInside
      const d = drag.current
      if (!d.on) {
        d.offset += d.vel
        d.vel *= 0.92
      }
      const narrow = window.innerWidth < 760
      const cardW = narrow ? 210 : 280
      const STEP = narrow ? 30 : 24 // degrees between neighbours
      const PITCH = narrow ? 70 : 64 // px climbed per card
      ring.style.setProperty('--r', `${((cardW + 40) * 360) / (STEP * 2 * Math.PI)}px`)

      // scroll climbs ~14 cards over the act; drag turns; the helix has no ends
      const target = (l - 0.1) * 14 - d.offset / STEP
      cursor.current += (target - cursor.current) * 0.1
      const c = cursor.current

      // recycle slots around the cursor
      const wantBase = Math.round(c) - HALF
      if (wantBase !== baseRef.current) {
        baseRef.current = wantBase
        setBase(wantBase)
      }

      // transition beats
      const ph = phase.current
      let outP = 0
      if (ph.kind === 'out') {
        outP = clamp01((now - ph.start) / OUT_MS)
        if (outP >= 1) {
          phase.current = { kind: 'in', start: now }
          setShown(filterRef.current)
        }
      } else if (ph.kind === 'in' && now - ph.start > IN_MS * 1.4) {
        phase.current = { kind: 'idle', start: now }
      }

      for (let j = 0; j < SLOTS; j++) {
        const el = slotRefs.current[j]
        if (!el) continue
        // each card knows which helix step it carries, so recycling never mis-places a frame
        const rel = Number(el.dataset.k) - c
        // stagger by distance from the front: the front card leaves first and arrives first
        const lag = Math.min(1, Math.abs(rel) / HALF) * 0.35
        const o = ph.kind === 'out' ? ease(clamp01((outP - lag * 0.6) / (1 - lag * 0.6))) : 0
        const i = ph.kind === 'in' ? ease(clamp01(((now - ph.start) / IN_MS - lag) / (1 - lag))) : 1
        const swirl = o * 320 - (1 - i) * 280
        const rise = -o * 640 + (1 - i) * 520

        const angle = rel * STEP + swirl
        const y = -rel * PITCH + rise
        const facing = Math.cos((angle * Math.PI) / 180)
        const near = Math.max(0, 1 - Math.abs(rel * PITCH) / (narrow ? 360 : 430))
        const alpha = near * (0.12 + 0.88 * Math.max(0, facing)) * (1 - o) * i
        el.style.transform = `translateY(${y.toFixed(1)}px) rotateY(${angle.toFixed(2)}deg) translateZ(var(--r))`
        el.style.opacity = alpha.toFixed(3)
        el.style.filter = facing < 0.35 ? `blur(${((0.35 - facing) * 5).toFixed(1)}px)` : ''
        el.style.zIndex = String(Math.round(facing * 100) + 100)
        el.style.pointerEvents = alpha > 0.5 && facing > 0.6 ? 'auto' : 'none'
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  // drag to turn the helix (only on the stage itself)
  useEffect(() => {
    const stage = ringRef.current?.parentElement
    if (!stage) return
    const d = drag.current
    const down = (e: PointerEvent) => {
      d.on = true
      d.x = e.clientX
      d.vel = 0
      d.moved = 0
    }
    const move = (e: PointerEvent) => {
      if (!d.on) return
      const dx = e.clientX - d.x
      d.x = e.clientX
      d.moved += Math.abs(dx)
      d.offset += dx * 0.18
      d.vel = dx * 0.18
    }
    const up = () => (d.on = false)
    stage.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      stage.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  const n = list.length

  return (
    <div className="archive">
      {/* hover render filter: signal-noise displacement + RGB channel split */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <filter id="m2-glitch" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.003 0.09" numOctaves="1" seed="2" result="noise">
            <animate attributeName="seed" values="1;4;8;2;6;9;3" dur="0.7s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" result="warp" />
          <feColorMatrix in="warp" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx="3" result="r2" />
          <feColorMatrix in="warp" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feColorMatrix in="warp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feOffset in="b" dx="-3" result="b2" />
          <feBlend in="r2" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b2" mode="screen" />
        </filter>
      </svg>
      <nav className="archive-filter" aria-label={t({ en: 'Project categories', zh: '作品分类' })}>
        <div className="archive-q">{t({ en: 'What are you looking for?', zh: '想看哪一类？' })}</div>
        {(['all', ...categories.map((c) => c.key)] as Filter[]).map((k) => {
          const label = k === 'all' ? { en: 'Everything', zh: '全部' } : categories.find((c) => c.key === k)!.label
          return (
            <button key={k} className={`archive-cat ${filter === k ? 'on' : ''}`} onClick={() => setFilter(k)}>
              <span className="arrow">-&gt;</span> {t(label)} <span className="archive-count">{String(listFor(k).length).padStart(2, '0')}</span>
            </button>
          )
        })}
      </nav>

      <div className="archive-stage" data-no-drag>
        <div className="archive-ring" ref={ringRef}>
          {Array.from({ length: SLOTS }, (_, j) => {
            const k = base + j
            const p = list[((k % n) + n) % n]
            return (
              <button
                key={k}
                data-k={k}
                ref={(el) => {
                  slotRefs.current[j] = el
                }}
                className="orbit-card"
                style={{ ['--hue' as string]: CAT_HUE[p.category] }}
                onClick={() => drag.current.moved < 6 && onOpen(p)}
                onPointerMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect()
                  e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
                  e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
                }}
                aria-label={p.name}
              >
                <div className="orbit-cover">
                  {p.image ? (
                    <img src={p.image} alt="" loading="lazy" draggable={false} />
                  ) : (
                    <div className="orbit-generated">
                      <span>{p.name}</span>
                    </div>
                  )}
                </div>
                <div className="orbit-meta">
                  <span className="orbit-name">{p.name}</span>
                  <span className="orbit-tag">
                    {t(categories.find((c) => c.key === p.category)!.label)} · {p.year}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
      <div className="archive-hint">{t({ en: 'scroll or drag to turn · click to open', zh: '滚动或拖动转动 · 点击打开' })}</div>
    </div>
  )
}
