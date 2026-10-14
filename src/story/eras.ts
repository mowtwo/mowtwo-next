import * as THREE from 'three'

/**
 * The look of each era, from medieval iron to future light. Index = act index
 * (forge, clockwork, circuit, neural, orbit, signal). `sampleEra(era)` blends
 * the two neighbours, so a scroll position between acts is a real in-between look.
 */
export type Era = {
  bg: string // clear colour + fog
  fogNear: number
  fogFar: number
  key: string // key light
  keyPower: number
  rim: string // rim / back light
  rimPower: number
  shell: string // mask shell
  shellMetal: number
  shellRough: number
  trim: string // cheeks
  eye: string // eye glow
  eyeGlow: number
  particle: string
  /** css accent for DOM text in this era */
  accent: string
}

export const ERAS: Era[] = [
  // I forge — cast iron in candle and furnace light, ember eyes
  {
    bg: '#0b0604', fogNear: 6, fogFar: 22,
    key: '#ffb070', keyPower: 120, rim: '#ff5a1a', rimPower: 70,
    shell: '#4a4038', shellMetal: 0.85, shellRough: 0.62, trim: '#7a4a24',
    eye: '#ff7a1a', eyeGlow: 2.4, particle: '#ff8a2a', accent: '#ff9a4a',
  },
  // II clockwork — polished brass, amber
  {
    bg: '#0a0805', fogNear: 6, fogFar: 24,
    key: '#ffd9a0', keyPower: 130, rim: '#d08a2a', rimPower: 60,
    shell: '#b8893a', shellMetal: 0.95, shellRough: 0.32, trim: '#6e4a1e',
    eye: '#ffc04a', eyeGlow: 2.2, particle: '#e8d2b0', accent: '#f2c46a',
  },
  // III circuit — chrome on copper, PCB green
  {
    bg: '#020806', fogNear: 6, fogFar: 26,
    key: '#c8fff0', keyPower: 120, rim: '#1aff9c', rimPower: 70,
    shell: '#a9b8b4', shellMetal: 1.0, shellRough: 0.2, trim: '#b0623a',
    eye: '#39ffb0', eyeGlow: 2.6, particle: '#39ffb0', accent: '#4dffb8',
  },
  // IV neural — white ceramic, cyan light (the "home" look)
  {
    bg: '#01030a', fogNear: 7, fogFar: 28,
    key: '#cdf4ff', keyPower: 130, rim: '#2f7bff', rimPower: 70,
    shell: '#dcebf2', shellMetal: 0.35, shellRough: 0.3, trim: '#8ea5b1',
    eye: '#5fe6ff', eyeGlow: 2.2, particle: '#5fe6ff', accent: '#5fe6ff',
  },
  // V orbit — iridescent violet, the archive
  {
    bg: '#04020c', fogNear: 7, fogFar: 30,
    key: '#e2d4ff', keyPower: 120, rim: '#8a4dff', rimPower: 80,
    shell: '#d8d0f0', shellMetal: 0.6, shellRough: 0.22, trim: '#7a6aa8',
    eye: '#b98aff', eyeGlow: 2.4, particle: '#b98aff', accent: '#c4a0ff',
  },
  // VI signal — pure light
  {
    bg: '#000308', fogNear: 7, fogFar: 28,
    key: '#ffffff', keyPower: 140, rim: '#5fe6ff', rimPower: 80,
    shell: '#eef8ff', shellMetal: 0.3, shellRough: 0.25, trim: '#9fb6c2',
    eye: '#bff6ff', eyeGlow: 3, particle: '#bff6ff', accent: '#8ff0ff',
  },
]

export type EraSample = {
  bg: THREE.Color
  fogNear: number
  fogFar: number
  key: THREE.Color
  keyPower: number
  rim: THREE.Color
  rimPower: number
  shell: THREE.Color
  shellMetal: number
  shellRough: number
  trim: THREE.Color
  eye: THREE.Color
  eyeGlow: number
  particle: THREE.Color
}

const COLOR_KEYS = ['bg', 'key', 'rim', 'shell', 'trim', 'eye', 'particle'] as const
const NUM_KEYS = ['fogNear', 'fogFar', 'keyPower', 'rimPower', 'shellMetal', 'shellRough', 'eyeGlow'] as const

const parsed = ERAS.map((e) => {
  const c = {} as Record<(typeof COLOR_KEYS)[number], THREE.Color>
  for (const k of COLOR_KEYS) c[k] = new THREE.Color(e[k])
  return c
})

export function createEraSample(): EraSample {
  const s = {} as EraSample
  for (const k of COLOR_KEYS) s[k] = new THREE.Color()
  for (const k of NUM_KEYS) s[k] = 0
  return s
}

/** write the blended look for a fractional era (0..ERAS.length-1) into `out` */
export function sampleEra(era: number, out: EraSample): EraSample {
  const max = ERAS.length - 1
  const e = THREE.MathUtils.clamp(era, 0, max)
  const i = Math.min(Math.floor(e), max - 1)
  const t = e - i
  for (const k of COLOR_KEYS) out[k].copy(parsed[i][k]).lerp(parsed[i + 1][k], t)
  for (const k of NUM_KEYS) out[k] = THREE.MathUtils.lerp(ERAS[i][k], ERAS[i + 1][k], t)
  return out
}

/** 0..1 weight of era `i` at fractional era `e` (triangle, so neighbours cross-fade) */
export const eraWeight = (e: number, i: number) => Math.max(0, 1 - Math.abs(e - i))
