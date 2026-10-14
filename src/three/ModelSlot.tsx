import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { createEraSample, sampleEra } from '../story/eras'
import type { Story } from '../story/useStory'

/**
 * ===================================================================
 *  M2 MASK — the hero model (original design, built in Blender).
 * ===================================================================
 *  Source: blender/m2-mask.blend → public/models/m2-mask.glb (Draco).
 *  The GLB keeps every part as its own node (Helmet, Visor, Skull,
 *  Cheek_L/R, Antenna_L/C/R, Eye_L/R) so each one can animate alone.
 *  Materials are assigned here, not in Blender, so the look stays in
 *  code next to the audio / scroll wiring.
 *
 *  Owned here:  era → materials (iron → brass → chrome → ceramic → light),
 *               act transitions → explode & reassemble, audio → eye glow,
 *               blinking, click glitch (pulseRef), hover brighten (hoverRef).
 *  Owned by World > Rig:  head pose (pointer, drag, scale, position).
 * ===================================================================
 */

const MODEL_URL = '/models/m2-mask.glb'
const DRACO_PATH = '/draco/'

type Props = {
  emissiveRef: React.MutableRefObject<number>
  storyRef: React.MutableRefObject<Story>
  /** performance.now() of the last click on the mask */
  pulseRef: React.MutableRefObject<number>
  /** 0..1, how close the pointer is to the mask on screen */
  hoverRef: React.MutableRefObject<number>
  /** 0..1 entrance progress — parts fly in from far apart */
  introRef: React.MutableRefObject<number>
  /** 1 = dormant (standby): parts hover apart, eyes breathe dimly */
  dormantRef: React.MutableRefObject<number>
}

/** where each part flies to in the exploded view (model space, ~units) */
const EXPLODE: Record<string, [number, number, number]> = {
  Helmet: [0, 0.05, 0.25],
  Visor: [0, -0.05, 0.7],
  Skull: [0, 0, -1.0],
  Cheek_L: [-1.0, -0.1, -0.1],
  Cheek_R: [1.0, -0.1, -0.1],
  Antenna_L: [-0.55, 0.75, 0],
  Antenna_C: [0, 1.0, 0],
  Antenna_R: [0.55, 0.75, 0],
  Eye_L: [-0.25, 0, 1.05],
  Eye_R: [0.25, 0, 1.05],
}

type Part = {
  obj: THREE.Object3D
  base: THREE.Vector3
  baseRot: THREE.Euler
  out: THREE.Vector3
  seed: number
  isEye: boolean
}

const smooth = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b)

export default function ModelSlot({ emissiveRef, storyRef, pulseRef, hoverRef, introRef, dormantRef }: Props) {
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH)

  const mats = useMemo(
    () => ({
      shell: new THREE.MeshPhysicalMaterial({
        color: '#dcebf2',
        metalness: 0.35,
        roughness: 0.3,
        clearcoat: 0.7,
        clearcoatRoughness: 0.22,
      }),
      trim: new THREE.MeshPhysicalMaterial({ color: '#8ea5b1', metalness: 0.75, roughness: 0.28 }),
      back: new THREE.MeshStandardMaterial({ color: '#0a0f17', metalness: 0.85, roughness: 0.34 }),
      visor: new THREE.MeshPhysicalMaterial({
        color: '#020409',
        metalness: 0.9,
        roughness: 0.07,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
      }),
      // toneMapped off so the cyan stays saturated instead of washing out to white
      eye: new THREE.MeshStandardMaterial({
        color: '#5fe6ff',
        emissive: '#5fe6ff',
        emissiveIntensity: 2,
        toneMapped: false,
      }),
    }),
    [],
  )

  const parts = useMemo(() => {
    const list: Part[] = []
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const name = o.name
      const isEye = name.startsWith('Eye')
      mesh.material = isEye
        ? mats.eye
        : name === 'Visor'
          ? mats.visor
          : name === 'Skull'
            ? mats.back
            : name.startsWith('Cheek')
              ? mats.trim
              : mats.shell
      const out = EXPLODE[name] ?? [0, 0, 0]
      list.push({
        obj: o,
        base: o.position.clone(),
        baseRot: o.rotation.clone(),
        out: new THREE.Vector3(...out),
        seed: list.length * 1.7 + 0.3,
        isEye,
      })
    })
    return list
  }, [scene, mats])

  const nextBlink = useRef(2.5)
  // mutated every frame, so held in refs rather than read off the memoised object
  const eyeMat = useRef(mats.eye)
  const shellMat = useRef(mats.shell)
  const trimMat = useRef(mats.trim)
  const sample = useMemo(() => createEraSample(), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const era = storyRef.current.view
    const sinceClick = (performance.now() - pulseRef.current) / 1000
    const glitch = sinceClick < 0.6 ? 1 - sinceClick / 0.6 : 0

    // between two acts the mask comes apart, changes era, and snaps back together
    const frac = era - Math.floor(era)
    const intro = 1 - Math.pow(1 - introRef.current, 3)
    const dormant = dormantRef.current
    const breathe = 0.32 + Math.sin(t * 0.9) * 0.06
    const ex = Math.max(Math.sin(Math.PI * smooth(0.05, 0.95, frac)) * 0.85, (1 - intro) * 2.4, dormant * breathe)

    // era look: shell / trim / eyes
    const s = sampleEra(era, sample)
    shellMat.current.color.copy(s.shell)
    shellMat.current.metalness = s.shellMetal
    shellMat.current.roughness = s.shellRough
    shellMat.current.clearcoat = THREE.MathUtils.clamp(era - 1.5, 0, 1) * 0.7 // iron and brass stay raw
    trimMat.current.color.copy(s.trim)
    eyeMat.current.color.copy(s.eye)
    eyeMat.current.emissive.copy(s.eye)

    // blink: a quick squash of both eyes every few seconds
    if (t > nextBlink.current + 0.16) nextBlink.current = t + 2.8 + Math.random() * 3.5
    const blinkT = (t - nextBlink.current) / 0.16
    const blink = blinkT > 0 && blinkT < 1 ? 1 - Math.sin(blinkT * Math.PI) * 0.92 : 1

    for (const p of parts) {
      const drift = ex * 0.06
      p.obj.position.set(
        p.base.x + p.out.x * ex + Math.sin(t * 0.7 + p.seed) * drift + (glitch ? (Math.random() - 0.5) * 0.08 * glitch : 0),
        p.base.y + p.out.y * ex + Math.cos(t * 0.6 + p.seed) * drift + (glitch ? (Math.random() - 0.5) * 0.08 * glitch : 0),
        p.base.z + p.out.z * ex,
      )
      p.obj.rotation.set(
        p.baseRot.x + Math.sin(t * 0.4 + p.seed) * 0.35 * ex,
        p.baseRot.y + Math.cos(t * 0.3 + p.seed) * 0.45 * ex,
        p.baseRot.z,
      )
      if (p.isEye) p.obj.scale.set(1, blink, 1)
    }

    // eyes: audio + hover + click flash
    const awake = s.eyeGlow * 0.5 + emissiveRef.current * 2.2 + hoverRef.current * 1.6 + glitch * 6
    const asleep = 0.35 + (Math.sin(t * 1.4) * 0.5 + 0.5) * 1.1 // slow breathing glow
    eyeMat.current.emissiveIntensity = THREE.MathUtils.lerp(awake, asleep, dormant)
  })

  return <primitive object={scene} />
}

useGLTF.preload(MODEL_URL, DRACO_PATH)
