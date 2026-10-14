import { useEffect, useRef, useState } from 'react'
import { ERAS } from './eras'

/**
 * Scroll → story. Every act is a <section data-act="i">. We measure where the
 * viewport centre sits and derive:
 *   era    fractional 0..5 — the scroll target for every look in the 3D world
 *   view   `era`, damped every frame by the World — what the 3D actually shows
 *   act    integer act under the viewport centre (for the nav / accent colour)
 *   local  0..1 progress through the current act
 * Each section also gets `--l` (its own 0..1 progress) so its DOM content can
 * fade / parallax in CSS without React re-rendering on scroll.
 */
export type Story = {
  era: number
  view: number
  act: number
  local: number
  progress: number
  /** 1 while the mask sleeps in standby, 0 in the film (written by the World rig) */
  dormant: number
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export function useStory() {
  const storyRef = useRef<Story>({ era: 0, view: 0, act: 0, local: 0, progress: 0, dormant: 1 })
  const [act, setAct] = useState(0)

  useEffect(() => {
    let queued = false
    let lastAct = -1

    const measure = () => {
      queued = false
      const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-act]'))
      if (!sections.length) return
      const vh = window.innerHeight
      const centre = window.scrollY + vh * 0.5
      const max = document.documentElement.scrollHeight - vh

      let era = 0
      let current = 0
      let local = 0
      sections.forEach((el, i) => {
        const top = el.offsetTop
        const h = Math.max(1, el.offsetHeight)
        const l = (centre - top) / h
        el.style.setProperty('--l', Math.min(1.2, Math.max(-0.2, l)).toFixed(4))
        if (centre >= top && centre < top + h) {
          current = i
          local = l
          // hold the era for the first part of the act, then cross into the next
          era = Math.min(ERAS.length - 1, i + smooth(0.42, 1, l))
        }
      })
      const last = sections[sections.length - 1]
      if (centre >= last.offsetTop + last.offsetHeight) {
        current = sections.length - 1
        era = ERAS.length - 1
        local = 1
      }

      const s = storyRef.current
      s.era = era
      s.act = current
      s.local = local
      s.progress = max > 0 ? window.scrollY / max : 0

      if (current !== lastAct) {
        lastAct = current
        setAct(current)
        document.documentElement.style.setProperty('--accent', ERAS[current].accent)
      }
    }

    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    // sections mount after the preloader — re-measure when the DOM grows
    const ro = new ResizeObserver(onScroll)
    ro.observe(document.body)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      ro.disconnect()
    }
  }, [])

  return { storyRef, act }
}
