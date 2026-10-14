import { useCallback, useEffect, useRef, useState } from 'react'
import { audioEngine } from './AudioEngine'

/** React wrapper over the singleton AudioEngine. `levelRef` is read in rAF by the orb. */
export function useAudio() {
  const [on, setOn] = useState(false)
  const levelRef = useRef(0)

  // mirror the engine's live level into a ref every frame
  useEffect(() => {
    let raf = 0
    const loop = () => {
      levelRef.current = audioEngine.level
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const toggle = useCallback(() => setOn(audioEngine.toggle()), [])
  const setUnderwater = useCallback((v: boolean) => audioEngine.setUnderwater(v), [])
  const setIntensity = useCallback((v: number) => audioEngine.setIntensity(v), [])

  return { on, toggle, setUnderwater, setIntensity, levelRef }
}
