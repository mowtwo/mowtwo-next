import { useEffect, useMemo, useRef } from 'react'
import { acts } from '../data/content'
import { useLocale } from '../i18n/context'
import type { Story } from '../story/useStory'
import M2Glyph from './M2Glyph'

type Props = {
  storyRef: React.MutableRefObject<Story>
  act: number
  audioOn: boolean
  onToggleAudio: () => void
}

const SIZE = 96
const C = SIZE / 2

/** outline of a gear as an SVG path (teeth on a circle) */
function gearPath(teeth: number, rOut: number, rIn: number) {
  const step = (Math.PI * 2) / teeth
  let d = ''
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    const pts = [
      [rIn, a],
      [rOut, a + step * 0.2],
      [rOut, a + step * 0.45],
      [rIn, a + step * 0.65],
    ]
    pts.forEach(([r, ang], j) => {
      d += `${i === 0 && j === 0 ? 'M' : 'L'}${(C + Math.cos(ang) * r).toFixed(2)} ${(C + Math.sin(ang) * r).toFixed(2)} `
    })
  }
  return d + 'Z'
}

const angleOf = (i: number) => -90 + i * (300 / (acts.length - 1)) // spread the acts over 300°

function goTo(key: string) {
  document.getElementById(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * Top-right instrument: an escapement-style dial. The outer gear turns with
 * the scroll, the needle points at the current era, and each Roman numeral is
 * a jump link to its act. Below it: sound + language.
 */
export default function GearDial({ storyRef, act, audioOn, onToggleAudio }: Props) {
  const { t, locale, setLocale } = useLocale()
  const gear = useMemo(() => gearPath(28, 44, 40.5), [])
  const gearRef = useRef<SVGPathElement>(null)
  const needleRef = useRef<SVGGElement>(null)

  useEffect(() => {
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const s = storyRef.current
      gearRef.current?.setAttribute('transform', `rotate(${(s.progress * 540).toFixed(2)} ${C} ${C})`)
      needleRef.current?.setAttribute('transform', `rotate(${(angleOf(s.era) + 90).toFixed(2)} ${C} ${C})`)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [storyRef])

  return (
    <>
      <button className="brand" onClick={() => goTo(acts[0].key)} aria-label="M2 — back to the start">
        <M2Glyph height={20} />
      </button>

      <div className="dial-wrap">
        <div className="dial-label" aria-live="polite">
          <span className="dial-roman">{acts[act].roman}</span>
          <span>{t(acts[act].name)}</span>
        </div>
        <svg className="dial" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="navigation" aria-label={t({ en: 'Acts', zh: '章节' })}>
          <path ref={gearRef} d={gear} className="dial-gear" />
          <circle cx={C} cy={C} r={33} className="dial-face" />
          {acts.map((a, i) => {
            const ang = (angleOf(i) * Math.PI) / 180
            const x = C + Math.cos(ang) * 25
            const y = C + Math.sin(ang) * 25
            return (
              <g key={a.key} className={`dial-notch ${i === act ? 'on' : ''}`} onClick={() => goTo(a.key)} role="link" aria-label={t(a.name)}>
                <title>{`${a.roman} · ${t(a.name)}`}</title>
                <circle cx={x} cy={y} r={7} className="dial-hit" />
                <text x={x} y={y + 2.6} textAnchor="middle">
                  {a.roman}
                </text>
              </g>
            )
          })}
          <g ref={needleRef}>
            <line x1={C} y1={C} x2={C} y2={C - 14} className="dial-needle" />
          </g>
          <circle cx={C} cy={C} r={2.6} className="dial-pin" />
        </svg>
        <div className="dial-tools">
          <button onClick={onToggleAudio} className="tool" aria-pressed={audioOn}>
            <span className={`bars ${audioOn ? 'on' : ''}`}>
              <i />
              <i />
              <i />
              <i />
            </span>
            {audioOn ? t({ en: 'Sound on', zh: '声音开' }) : t({ en: 'Sound off', zh: '声音关' })}
          </button>
          <button className="tool" onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')} aria-label="Switch language">
            <span className={locale === 'en' ? 'on' : ''}>EN</span> / <span className={locale === 'zh' ? 'on' : ''}>中</span>
          </button>
        </div>
      </div>
    </>
  )
}
