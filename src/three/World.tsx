import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Bloom, EffectComposer, Noise } from '@react-three/postprocessing'
import type { BloomEffect } from 'postprocessing'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import ModelSlot from './ModelSlot'
import EraParticles from './EraParticles'
import EraProps from './EraProps'
import { Arcs, SparkBursts } from './Sparks'
import { createEraSample, ERAS, sampleEra } from '../story/eras'
import type { Story } from '../story/useStory'
import type { Stage } from '../App'

type Refs = {
  storyRef: React.MutableRefObject<Story>
  /** loading → standby (dormant mask in the ring) → film */
  stage?: Stage
  pointerRef: React.MutableRefObject<{ x: number; y: number }>
  levelRef: React.MutableRefObject<number>
}

/** damp the scroll era into `view` so every era-driven look glides instead of stepping */
function EraDamper({ storyRef }: Pick<Refs, 'storyRef'>) {
  useFrame((_, dt) => {
    const s = storyRef.current
    s.view += (s.era - s.view) * (1 - Math.exp(-dt * 3.2))
    if (Math.abs(s.era - s.view) < 1e-4) s.view = s.era
  })
  return null
}

/* ------------------------------------------------------- atmosphere -- */

/** background, fog and the two main lights follow the era; the forge flickers like fire */
function Atmosphere({ storyRef, levelRef }: Pick<Refs, 'storyRef' | 'levelRef'>) {
  const scene = useThree((s) => s.scene)
  const sample = useMemo(() => createEraSample(), [])
  const key = useRef<THREE.PointLight>(null)
  const rim = useRef<THREE.PointLight>(null)
  useLayoutEffect(() => {
    scene.background = new THREE.Color(ERAS[0].bg)
    scene.fog = new THREE.Fog(ERAS[0].bg, ERAS[0].fogNear, ERAS[0].fogFar)
  }, [scene])

  useFrame(({ clock }) => {
    const era = storyRef.current.view
    const s = sampleEra(era, sample)
    ;(scene.background as THREE.Color).copy(s.bg)
    const fog = scene.fog as THREE.Fog
    fog.color.copy(s.bg)
    fog.near = s.fogNear
    fog.far = s.fogFar
    const t = clock.elapsedTime
    const fire = Math.max(0, 1 - era) // only in the forge
    const flicker = 1 + fire * (Math.sin(t * 11) * 0.08 + Math.sin(t * 27.3) * 0.06)
    if (key.current) {
      key.current.color.copy(s.key)
      key.current.intensity = s.keyPower * flicker * (1 + levelRef.current * 0.3)
    }
    if (rim.current) {
      rim.current.color.copy(s.rim)
      rim.current.intensity = s.rimPower * flicker
    }
  })

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight ref={key} position={[4, 4, 5]} decay={2} />
      <pointLight ref={rim} position={[-5, -2, 1.5]} decay={2} />
    </>
  )
}

/** soft additive halo behind the mask, tinted with the eye colour */
function Halo({ storyRef, levelRef, target }: Pick<Refs, 'storyRef' | 'levelRef'> & { target: React.RefObject<THREE.Group | null> }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    g.addColorStop(0, 'rgba(255,255,255,0.9)')
    g.addColorStop(0.25, 'rgba(255,255,255,0.45)')
    g.addColorStop(0.6, 'rgba(255,255,255,0.12)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    return new THREE.CanvasTexture(c)
  }, [])
  const sample = useMemo(() => createEraSample(), [])
  const ref = useRef<THREE.Sprite>(null)
  useFrame(({ clock }) => {
    const sp = ref.current
    const g = target.current
    if (!sp || !g) return
    sp.visible = g.visible
    const s = sampleEra(storyRef.current.view, sample)
    ;(sp.material as THREE.SpriteMaterial).color.copy(s.eye)
    const size = 5.2 * g.scale.x * (1 + levelRef.current * 0.2 + Math.sin(clock.elapsedTime * 1.2) * 0.035)
    sp.scale.set(size, size, 1)
    sp.position.set(g.position.x, g.position.y, -0.8)
  })
  return (
    <sprite ref={ref}>
      <spriteMaterial map={tex} transparent opacity={0.32} depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  )
}

/* -------------------------------------------------------------- rig -- */

const TAU = Math.PI * 2
const INTERACTIVE = 'a, button, input, textarea, select, [role="button"], [data-no-drag]'

/** where the mask stands in each act (x, y, scale) — the HUD acts are composed around it */
const POSES: [number, number, number][] = [
  [0, 0.02, 0.98], // forge — in front of the giant M2
  [0, 0.06, 0.66], // clockwork — inside the watch face
  [0, 0.06, 0.66], // circuit — the board's processor
  [0, 0.06, 0.66], // neural — the constellation's core
  [0, 4.4, 0.36], // orbit — leave the stage to the archive
  [0, 1.45, 0.62], // signal — above the contact lines
]

function poseAt(era: number, out: THREE.Vector3, narrow: boolean) {
  const i = Math.min(Math.floor(era), POSES.length - 2)
  const t = THREE.MathUtils.clamp(era - i, 0, 1)
  const a = POSES[i]
  const b = POSES[i + 1]
  out.set(THREE.MathUtils.lerp(a[0], b[0], t), THREE.MathUtils.lerp(a[1], b[1], t), THREE.MathUtils.lerp(a[2], b[2], t))
  if (narrow) {
    // phones: keep the mask centred, above the text, never clipped (the archive keeps it off-stage)
    out.x = 0
    if (out.y < 3) out.y = Math.min(1.2, out.y * 0.5 + 1.1)
    out.z *= 0.72
  }
  return out
}

const STANDBY_POSE = new THREE.Vector3(0, 0.12, 0.92)
const STANDBY_POSE_NARROW = new THREE.Vector3(0, 0.3, 0.6)

function Rig({ storyRef, pointerRef, levelRef, stage = 'loading', group }: Refs & { group: React.RefObject<THREE.Group | null> }) {
  // 0 → 1 after loading: the mask flies in from scattered parts
  const introRef = useRef(0)
  // 1 = dormant in standby (centred, half apart), 0 = awake in the film
  const dormantRef = useRef(1)
  const emissiveRef = useRef(0.7)
  const pulseRef = useRef(-1e9)
  const hoverRef = useRef(0)
  const camera = useThree((s) => s.camera)

  // drag-to-spin: yaw offset with inertia, springs back to facing the viewer
  const spin = useRef({ yaw: 0, vel: 0, dragging: false, lastX: 0, lastT: 0, startX: 0, startY: 0 })
  // where the mask sits on screen (NDC) — for hover + click hit testing
  const screen = useRef({ x: 0, y: 0, r: 0.3 })
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const pose = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    const s = spin.current
    const nearMask = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -((e.clientY / window.innerHeight) * 2 - 1)
      const aspect = window.innerWidth / window.innerHeight
      return Math.hypot((x - screen.current.x) * aspect, y - screen.current.y) < screen.current.r
    }
    const end = () => {
      s.dragging = false
      document.documentElement.style.cursor = ''
      document.body.style.userSelect = ''
    }
    const down = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.(INTERACTIVE)) return
      if (document.body.style.overflow === 'hidden') return // overlay open
      if (!nearMask(e)) return // only grab when pressing on the mask itself
      s.dragging = true
      s.lastX = s.startX = e.clientX
      s.startY = e.clientY
      s.lastT = performance.now()
      s.vel = 0
      document.body.style.userSelect = 'none' // no text highlighting while spinning
    }
    const move = (e: PointerEvent) => {
      const hovering = nearMask(e) && !(e.target as Element | null)?.closest?.(INTERACTIVE)
      document.documentElement.style.cursor = s.dragging ? 'grabbing' : hovering ? 'grab' : ''
      if (!s.dragging) return
      if (e.pointerType === 'mouse' && e.buttons === 0) return end() // released outside the window
      const now = performance.now()
      const dx = e.clientX - s.lastX
      const step = Math.max(8, now - s.lastT) / 1000
      s.lastX = e.clientX
      s.lastT = now
      s.yaw += dx * 0.008
      // smoothed angular velocity in rad/s, capped so a flick never spins for seconds
      s.vel = THREE.MathUtils.clamp(THREE.MathUtils.lerp(s.vel, (dx * 0.008) / step, 0.5), -8, 8)
    }
    const up = (e: PointerEvent) => {
      if (!s.dragging) return
      end()
      if (performance.now() - s.lastT > 90) s.vel = 0 // held still before letting go
      const moved = Math.hypot(e.clientX - s.startX, e.clientY - s.startY)
      if (moved < 6 && nearMask(e)) pulseRef.current = performance.now()
    }
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    window.addEventListener('blur', end)
    return () => {
      window.removeEventListener('blur', end)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      end()
    }
  }, [])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const story = storyRef.current
    const level = levelRef.current
    const p = pointerRef.current
    const s = spin.current
    const g = group.current
    if (!g) return
    if (stage !== 'loading') introRef.current = Math.min(1, introRef.current + dt / 2.2)
    const intro = 1 - Math.pow(1 - introRef.current, 3)
    dormantRef.current += ((stage === 'film' ? 0 : 1) - dormantRef.current) * (1 - Math.exp(-dt * 2.4))
    const dormant = dormantRef.current
    story.dormant = dormant
    g.visible = introRef.current > 0

    // inertia, then a soft spring back to the nearest "facing" turn
    if (!s.dragging) {
      s.yaw += s.vel * dt
      s.vel *= Math.pow(0.04, dt)
      if (Math.abs(s.vel) < 0.6) {
        const home = Math.round(s.yaw / TAU) * TAU
        s.yaw += (home - s.yaw) * (1 - Math.pow(0.08, dt))
      }
    }

    // pose for this point in the story; the mask turns slightly toward the text side
    const narrow = state.size.width / state.size.height < 0.8
    poseAt(story.view, pose, narrow)
    pose.lerp(narrow ? STANDBY_POSE_NARROW : STANDBY_POSE, dormant)
    const faceText = narrow ? 0 : -Math.sign(pose.x) * 0.18 * (1 - dormant)

    // head pose: look toward the pointer, breathe a little when idle
    const lookYaw = p.x * 0.55 + faceText + Math.sin(t * 0.35) * 0.06
    const lookPitch = p.y * 0.32 + Math.sin(t * 0.5) * 0.03
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, lookYaw + s.yaw, 0.08)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, lookPitch, 0.06)
    g.rotation.z = Math.sin(t * 0.15) * 0.04 - p.x * 0.05
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, pose.z * (1 + level * 0.06) * (0.6 + 0.4 * intro), 0.08))
    g.position.x = THREE.MathUtils.lerp(g.position.x, pose.x + p.x * 0.25, 0.06)
    g.position.y = THREE.MathUtils.lerp(g.position.y, pose.y + Math.sin(t * 0.8) * 0.04, 0.08)

    // screen-space footprint of the mask for hover / click tests
    tmp.copy(g.position).project(camera)
    screen.current.x = tmp.x
    screen.current.y = tmp.y
    screen.current.r = 0.42 * g.scale.x
    const aspect = state.size.width / state.size.height
    const d = Math.hypot((p.x - tmp.x) * aspect, -p.y - tmp.y) / screen.current.r
    hoverRef.current = THREE.MathUtils.lerp(hoverRef.current, d < 1 ? 1 - d * 0.6 : 0, 0.1)

    emissiveRef.current = 0.3 + level * 1.1
  })

  return (
    <>
      <Halo storyRef={storyRef} levelRef={levelRef} target={group} />
      <group ref={group}>
        <ModelSlot
          emissiveRef={emissiveRef}
          storyRef={storyRef}
          pulseRef={pulseRef}
          hoverRef={hoverRef}
          introRef={introRef}
          dormantRef={dormantRef}
        />
      </group>
    </>
  )
}

/** real bloom on everything bright (eyes, arcs, sparks, furnace), breathing with the music */
function Post({ levelRef }: Pick<Refs, 'levelRef'>) {
  const bloom = useRef<BloomEffect>(null)
  useFrame(() => {
    if (bloom.current) bloom.current.intensity = 0.9 + levelRef.current * 1.6
  })
  return (
    <EffectComposer multisampling={0}>
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.55} luminanceSmoothing={0.2} intensity={0.9} radius={0.72} />
      <Noise opacity={0.045} premultiply />
    </EffectComposer>
  )
}

/** studio reflections built from light panels — no HDR download */
function Reflections() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={3} color="#ffffff" position={[3, 3, 4]} scale={[4, 2, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.6} color="#9fc8ff" position={[-5, 0, 1]} scale={[2, 6, 1]} target={[0, 0, 0]} />
      <Lightformer form="ring" intensity={1.2} color="#ffffff" position={[0, 4, -3]} scale={3} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={0.6} color="#ffffff" position={[0, -4, 2]} scale={[6, 1, 1]} target={[0, 0, 0]} />
    </Environment>
  )
}

export default function World({ storyRef, pointerRef, levelRef, stage }: Refs) {
  // the mask's group, shared so sparks and arcs can find the robot
  const maskRef = useRef<THREE.Group>(null)
  return (
    <div className="world" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 5.2], fov: 50 }} dpr={[1, 2]} gl={{ antialias: true }} style={{ pointerEvents: 'none' }}>
        <EraDamper storyRef={storyRef} />
        <Atmosphere storyRef={storyRef} levelRef={levelRef} />
        <EraParticles storyRef={storyRef} levelRef={levelRef} />
        <Suspense fallback={null}>
          <EraProps storyRef={storyRef} pointerRef={pointerRef} />
        </Suspense>
        <SparkBursts storyRef={storyRef} levelRef={levelRef} />
        <Arcs storyRef={storyRef} levelRef={levelRef} maskRef={maskRef} />
        <Suspense fallback={null}>
          <Reflections />
          <Rig storyRef={storyRef} pointerRef={pointerRef} levelRef={levelRef} stage={stage} group={maskRef} />
        </Suspense>
        <Post levelRef={levelRef} />
      </Canvas>
    </div>
  )
}
