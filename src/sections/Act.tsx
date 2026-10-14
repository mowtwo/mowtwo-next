import type { CSSProperties, ReactNode } from 'react'
import { acts } from '../data/content'
import { useLocale } from '../i18n/context'

type Props = {
  index: number
  /** section height in vh — longer acts dwell longer before the next era */
  length?: number
  /** which side the copy sits on (the mask stands on the other) */
  side?: 'left' | 'right' | 'center' | 'hud'
  children: ReactNode
  style?: CSSProperties
}

/**
 * One act of the film. The section is tall; its content is sticky, so it holds
 * on screen while the 3D world plays. `--l` (0..1, set by useStory) drives the
 * fade + parallax in CSS (see .act-inner in index.css).
 */
export default function Act({ index, length = 170, side = 'left', children, style }: Props) {
  const { t } = useLocale()
  const act = acts[index]
  return (
    <section id={act.key} data-act={index} className="act" style={{ height: `${length}vh`, ...style }}>
      <div className={`act-sticky act-${side}`}>
        <div className="act-inner">
          <div className="act-eyebrow">
            <span className="act-roman">{act.roman}</span>
            <span>{t(act.name)}</span>
            <span className="act-era">// {t(act.era)}</span>
          </div>
          {children}
        </div>
      </div>
    </section>
  )
}
