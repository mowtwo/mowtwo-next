import { useEffect, useRef } from 'react'
import { useLocale } from '../i18n/context'

type Props = {
  /** `gesture` = the trigger counts as a user activation (click / key), so audio may start now */
  onEnter: (opts: { sound: boolean; gesture: boolean }) => void
}

const ENTER_KEYS = new Set(['ArrowDown', 'PageDown', ' ', 'Enter'])

/**
 * Standby: the mask floats half-assembled in the furnace ring (drawn by the
 * World). This overlay only carries the hint and the two small choices. Any
 * downward intent enters: wheel, swipe up, arrow / space / enter, or a click
 * on the centre.
 */
export default function Standby({ onEnter }: Props) {
  const { t, locale, setLocale } = useLocale()
  const done = useRef(false)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)

    const go = (sound: boolean, gesture: boolean) => {
      if (done.current) return
      done.current = true
      onEnter({ sound, gesture })
    }
    // ignore the tail of the wheel gesture that brought us back here
    const armedAt = performance.now() + 700
    const onWheel = (e: WheelEvent) => {
      if (performance.now() > armedAt && e.deltaY > 8) go(true, false)
    }
    let touchY = 0
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0].clientY)
    const onTouchMove = (e: TouchEvent) => {
      if (touchY - e.touches[0].clientY > 40) go(true, false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (ENTER_KEYS.has(e.key)) {
        e.preventDefault()
        go(true, true)
      }
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
    }
  }, [onEnter])

  const enter = (sound: boolean) => {
    if (done.current) return
    done.current = true
    onEnter({ sound, gesture: true })
  }

  return (
    <div className="standby">
      {/* the centre is the mask itself — clicking it enters */}
      <button className="standby-hit" onClick={() => enter(true)} aria-label={t({ en: 'Enter', zh: '进入' })} />

      <div className="standby-title">
        <span>M2</span>
        <span className="standby-sep">//</span>
        <span>LEVEL 2</span>
      </div>

      <div className="standby-hint">
        <div className="standby-chevrons" aria-hidden>
          <i />
          <i />
          <i />
        </div>
        <div>{t({ en: 'Scroll to enter', zh: '下滑进入' })}</div>
        <div className="standby-sub">{t({ en: 'sound on · headphones recommended', zh: '声音已开启 · 建议戴耳机' })}</div>
      </div>

      <div className="standby-foot">
        <button onClick={() => enter(false)}>{t({ en: 'Enter muted', zh: '静音进入' })}</button>
        <span className="standby-dot" />
        <button onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}>{locale === 'en' ? '中文' : 'English'}</button>
      </div>
    </div>
  )
}
