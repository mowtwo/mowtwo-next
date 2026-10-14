import type { CSSProperties, ReactNode } from 'react'

/**
 * A HUD composed around the centred mask. Panels sit on the left or right of
 * the robot at a given height (% of the viewport); an SVG overlay draws a
 * connector from the mask's edge to each panel. `wire` picks the drawing:
 *   straight  a clean leader line with a tick (clockwork)
 *   pcb       right-angle traces with a running current pulse (circuit)
 *   curve     soft synapse curves (neural)
 * Panels and wires reveal in sequence from the act's `--l` (pure CSS).
 */
export type HudNode = { side: 'left' | 'right'; y: number; children: ReactNode; glow?: boolean; /** dropped on phones to keep the act on one screen */ mobileHide?: boolean }

const CX = 50
const CY = 48
const EDGE = 10 // half-width of the mask footprint, in % of the viewport width
const ANCHOR = { left: 33, right: 67 }

function wirePath(kind: 'straight' | 'pcb' | 'curve', side: 'left' | 'right', y: number) {
  const dir = side === 'left' ? -1 : 1
  const x0 = CX + dir * EDGE
  const y0 = CY + (y - CY) * 0.35
  const x1 = ANCHOR[side]
  if (kind === 'pcb') {
    const mid = x0 + (x1 - x0) * 0.45
    return `M${x0} ${y0} H${mid} V${y} H${x1}`
  }
  if (kind === 'curve') {
    return `M${x0} ${y0} C${x0 + dir * 8} ${y0}, ${x1 - dir * 10} ${y}, ${x1} ${y}`
  }
  return `M${x0} ${y0} L${x1} ${y}`
}

export function Hud({
  nodes,
  wire,
  children,
  className = '',
}: {
  nodes: HudNode[]
  wire: 'straight' | 'pcb' | 'curve'
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={`hud hud-${wire} ${className}`}>
      <svg className="hud-wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {nodes.map((n, i) => {
          const d = wirePath(wire, n.side, n.y)
          return (
            <g key={i} style={{ ['--i' as string]: i } as CSSProperties}>
              <path d={d} className="hud-wire" pathLength={1} vectorEffect="non-scaling-stroke" />
              {wire === 'pcb' && <path d={d} className="hud-pulse" pathLength={1} vectorEffect="non-scaling-stroke" />}
            </g>
          )
        })}
      </svg>
      {children}
      {nodes.map((n, i) => (
        <div
          key={i}
          className={`hud-node hud-${n.side} ${n.glow ? 'glow' : ''} ${n.mobileHide ? 'mobile-hide' : ''}`}
          style={{ top: `${n.y}%`, ['--i' as string]: i } as CSSProperties}
        >
          {n.children}
        </div>
      ))}
    </div>
  )
}

/** a graduated watch-face ring around the mask (clockwork) */
export function DialRing() {
  const ticks = Array.from({ length: 60 }, (_, i) => i)
  return (
    <svg className="dial-ring" viewBox="-50 -50 100 100" aria-hidden>
      <circle r={46} className="dr-outer" />
      <circle r={40} className="dr-inner" />
      <g className="dr-ticks">
        {ticks.map((i) => {
          const a = (i / 60) * Math.PI * 2
          const long = i % 5 === 0
          const r0 = long ? 40.5 : 42.5
          return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * 45} y2={Math.sin(a) * 45} />
        })}
      </g>
      {['XII', 'III', 'VI', 'IX'].map((r, i) => {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 2
        return (
          <text key={r} x={Math.cos(a) * 35} y={Math.sin(a) * 35 + 1.6} textAnchor="middle">
            {r}
          </text>
        )
      })}
    </svg>
  )
}
