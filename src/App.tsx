import { useCallback, useEffect, useRef, useState } from 'react'
import World from './three/World'
import Preloader from './components/Preloader'
import Standby from './components/Standby'
import GearDial from './components/GearDial'
import ProjectDetail from './components/ProjectDetail'
import CursorTrail from './components/CursorTrail'
import { ActCircuit, ActClockwork, ActForge, ActNeural, ActOrbit, ActSignal } from './sections/Acts'
import { useAudio } from './audio/useAudio'
import { useStory } from './story/useStory'
import { type Project } from './data/content'

export type Stage = 'loading' | 'standby' | 'film'

export default function App() {
  const [stage, setStage] = useState<Stage>('loading')
  const [selected, setSelected] = useState<Project | null>(null)
  const { on, toggle, setUnderwater, setIntensity, levelRef } = useAudio()
  const { storyRef, act } = useStory()
  const pointerRef = useRef({ x: 0, y: 0 })

  // Sound is on by default. Browsers only let audio start from a click / key,
  // so a scroll-to-enter "arms" it and the first gesture anywhere starts it.
  const [soundWanted, setSoundWanted] = useState(true)
  const onRef = useRef(on)
  useEffect(() => {
    onRef.current = on
  }, [on])
  useEffect(() => {
    if (!soundWanted || on || stage === 'loading') return
    const start = () => {
      if (!onRef.current) toggle()
    }
    const opts = { once: true, capture: true } as const
    window.addEventListener('pointerdown', start, opts)
    window.addEventListener('keydown', start, opts)
    window.addEventListener('touchend', start, opts)
    return () => {
      window.removeEventListener('pointerdown', start, opts)
      window.removeEventListener('keydown', start, opts)
      window.removeEventListener('touchend', start, opts)
    }
  }, [soundWanted, on, stage, toggle])

  const toggleSound = useCallback(() => {
    if (on) {
      toggle()
      setSoundWanted(false)
    } else {
      setSoundWanted(true)
      toggle()
    }
  }, [on, toggle])

  const enter = useCallback(
    ({ sound, gesture }: { sound: boolean; gesture: boolean }) => {
      setSoundWanted(sound)
      if (sound && gesture && !onRef.current) toggle()
      if (!sound && onRef.current) toggle()
      setStage('film')
    },
    [toggle],
  )

  // at the very top, keep pulling up → back to standby
  useEffect(() => {
    if (stage !== 'film') return
    const since = performance.now()
    let pull = 0
    let decay = 0
    const back = () => {
      if (performance.now() - since < 1200 || selected) return
      setStage('standby')
    }
    const onWheel = (e: WheelEvent) => {
      if (window.scrollY > 2 || e.deltaY >= 0) {
        pull = 0
        return
      }
      pull += -e.deltaY
      clearTimeout(decay)
      decay = window.setTimeout(() => (pull = 0), 400)
      if (pull > 260) back()
    }
    let touchY = 0
    let atTop = false
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY
      atTop = window.scrollY <= 2
    }
    const onTouchMove = (e: TouchEvent) => {
      if (atTop && e.touches[0].clientY - touchY > 110) back()
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      clearTimeout(decay)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [stage, selected])

  // story depth → music intensity (busier, brighter as the machine evolves)
  useEffect(() => {
    let raf = 0
    let last = -1
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const p = Math.round(storyRef.current.progress * 50) / 50
      if (p !== last) setIntensity((last = p))
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [storyRef, setIntensity])

  // pointer → head tracking + parallax
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointerRef.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 }
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // nothing scrolls until the film starts (standby locks itself)
  useEffect(() => {
    if (stage !== 'loading') return
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    return () => {
      document.body.style.overflow = ''
    }
  }, [stage])

  // open a project → muffle the music, lock the page
  useEffect(() => {
    setUnderwater(!!selected)
    if (stage === 'film') document.body.style.overflow = selected ? 'hidden' : ''
  }, [selected, setUnderwater, stage])

  return (
    <>
      <World storyRef={storyRef} pointerRef={pointerRef} levelRef={levelRef} stage={stage} />

      {/* vignette for text legibility over the world */}
      <div className="vignette" />
      <CursorTrail />

      {stage === 'film' && <GearDial storyRef={storyRef} act={act} audioOn={on || soundWanted} onToggleAudio={toggleSound} />}

      <main className={`film ${stage === 'film' ? 'in' : ''}`} aria-hidden={stage !== 'film'}>
        <ActForge />
        <ActClockwork />
        <ActCircuit />
        <ActNeural />
        <ActOrbit onOpen={setSelected} />
        <ActSignal />
      </main>

      <ProjectDetail project={selected} onClose={() => setSelected(null)} />

      {stage === 'standby' && <Standby onEnter={enter} />}
      {stage === 'loading' && <Preloader onDone={() => setStage('standby')} />}
    </>
  )
}
