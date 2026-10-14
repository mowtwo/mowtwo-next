import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createEraSample, eraWeight, sampleEra } from '../story/eras'
import type { Story } from '../story/useStory'

type Common = {
  storyRef: React.MutableRefObject<Story>
  levelRef: React.MutableRefObject<number>
  maskRef: React.RefObject<THREE.Group | null>
}

/* ---------------------------------------------------------- sparks -- */

const SPARKS = 520

const sparkVert = /* glsl */ `
attribute float aLife;
attribute float aSize;
uniform float uPixelRatio;
varying float vLife;
void main() {
  vLife = aLife;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * aLife * uPixelRatio * (10.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`
const sparkFrag = /* glsl */ `
uniform vec3 uColor;
varying float vLife;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float core = smoothstep(0.5, 0.0, d);
  // hot white core cooling to the era colour as the spark dies
  vec3 c = mix(uColor, vec3(1.0, 0.95, 0.85), vLife * vLife);
  gl_FragColor = vec4(c, core * vLife);
}
`

/**
 * Grinding / forge sparks: bursts thrown from the furnace ring and the gear
 * teeth, with gravity and drag. Strongest in the iron and clockwork eras;
 * louder music → more frequent bursts.
 */
export function SparkBursts({ storyRef, levelRef }: Omit<Common, 'maskRef'>) {
  const dpr = useThree((s) => s.viewport.dpr)
  const sample = useMemo(() => createEraSample(), [])
  const sim = useMemo(
    () => ({
      pos: new Float32Array(SPARKS * 3),
      vel: new Float32Array(SPARKS * 3),
      life: new Float32Array(SPARKS),
      size: new Float32Array(SPARKS),
      decay: new Float32Array(SPARKS),
      next: 0,
      cooldown: 0.4,
    }),
    [],
  )
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(sim.pos, 3).setUsage(THREE.DynamicDrawUsage))
    g.setAttribute('aLife', new THREE.BufferAttribute(sim.life, 1).setUsage(THREE.DynamicDrawUsage))
    g.setAttribute('aSize', new THREE.BufferAttribute(sim.size, 1))
    return g
  }, [sim])
  const mat = useRef(
    new THREE.ShaderMaterial({
      vertexShader: sparkVert,
      fragmentShader: sparkFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color('#ff8a2a') }, uPixelRatio: { value: 1 } },
    }),
  )

  const burst = (x: number, y: number, z: number, n: number, dirX: number, dirY: number) => {
    for (let k = 0; k < n; k++) {
      const i = sim.next
      sim.next = (sim.next + 1) % SPARKS
      sim.pos[i * 3] = x
      sim.pos[i * 3 + 1] = y
      sim.pos[i * 3 + 2] = z
      const sp = 2 + Math.random() * 4.5
      const a = Math.atan2(dirY, dirX) + (Math.random() - 0.5) * 1.6
      sim.vel[i * 3] = Math.cos(a) * sp
      sim.vel[i * 3 + 1] = Math.sin(a) * sp + 1.2
      sim.vel[i * 3 + 2] = (Math.random() - 0.5) * 2
      sim.life[i] = 1
      sim.size[i] = 1.5 + Math.random() * 3
      sim.decay[i] = 0.7 + Math.random() * 1.1
    }
  }

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const view = storyRef.current.view
    const w = Math.max(eraWeight(view, 0), eraWeight(view, 1) * 0.8)
    mat.current.uniforms.uPixelRatio.value = dpr
    mat.current.uniforms.uColor.value.copy(sampleEra(view, sample).particle)

    // emit
    sim.cooldown -= dt * (1 + levelRef.current * 4)
    if (w > 0.05 && sim.cooldown <= 0) {
      sim.cooldown = 0.35 + Math.random() * 0.9
      const a = Math.random() * Math.PI * 2
      if (view < 0.7) {
        // off the furnace ring (forge layer sits at z -3, radius 2.7)
        burst(Math.cos(a) * 2.7, Math.sin(a) * 2.7, -3, Math.round(18 + 30 * w), Math.cos(a), Math.sin(a))
      } else {
        // where gear teeth grind: a few fixed contact points in the clockwork layer
        const pts = [
          [-2.2, 3.1, -7],
          [3.2, -0.6, -5.5],
          [-3.6, -1.6, -4.8],
        ]
        const p = pts[Math.floor(Math.random() * pts.length)]
        burst(p[0], p[1], p[2], Math.round(14 + 24 * w), Math.random() - 0.5, 1)
      }
    }

    // integrate
    for (let i = 0; i < SPARKS; i++) {
      if (sim.life[i] <= 0) continue
      const j = i * 3
      sim.vel[j + 1] -= 6.5 * dt // gravity
      sim.vel[j] *= 1 - 1.2 * dt
      sim.vel[j + 1] *= 1 - 0.6 * dt
      sim.pos[j] += sim.vel[j] * dt
      sim.pos[j + 1] += sim.vel[j + 1] * dt
      sim.pos[j + 2] += sim.vel[j + 2] * dt
      sim.life[i] = Math.max(0, sim.life[i] - sim.decay[i] * dt)
    }
    geo.attributes.position.needsUpdate = true
    geo.attributes.aLife.needsUpdate = true
  })

  return <points geometry={geo} material={mat.current} frustumCulled={false} />
}

/* ------------------------------------------------------------ arcs -- */

const BOLTS = 5
const SEGS = 22

type Bolt = { life: number; ttl: number; from: THREE.Vector3; to: THREE.Vector3; flick: number }

/**
 * Electric arcs crackling off the mask — jagged bolts rebuilt by midpoint
 * displacement every few frames, with glowing beads along them. They belong
 * to the electric eras (circuit, neural) and the final signal.
 */
export function Arcs({ storyRef, levelRef, maskRef }: Common) {
  const sample = useMemo(() => createEraSample(), [])
  const bolts = useMemo<Bolt[]>(
    () =>
      Array.from({ length: BOLTS }, () => ({ life: 0, ttl: 0.2, from: new THREE.Vector3(), to: new THREE.Vector3(), flick: 0 })),
    [],
  )
  const { lineGeo, beadGeo } = useMemo(() => {
    // one line-segments buffer for all bolts (SEGS segments each)
    const lg = new THREE.BufferGeometry()
    lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(BOLTS * SEGS * 2 * 3), 3).setUsage(THREE.DynamicDrawUsage))
    const bg = new THREE.BufferGeometry()
    bg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(BOLTS * (SEGS + 1) * 3), 3).setUsage(THREE.DynamicDrawUsage))
    return { lineGeo: lg, beadGeo: bg }
  }, [])
  const lineMat = useRef(
    new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
  )
  const beadMat = useRef(
    new THREE.PointsMaterial({
      size: 0.09,
      color: '#5fe6ff',
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    }),
  )
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const pts = useMemo(() => Array.from({ length: SEGS + 1 }, () => new THREE.Vector3()), [])

  /** jagged path from a to b by recursive midpoint displacement */
  const jag = (a: THREE.Vector3, b: THREE.Vector3) => {
    pts[0].copy(a)
    pts[SEGS].copy(b)
    const len = a.distanceTo(b)
    const fill = (i0: number, i1: number, amp: number) => {
      if (i1 - i0 < 2) return
      const m = (i0 + i1) >> 1
      pts[m].copy(pts[i0]).lerp(pts[i1], 0.5)
      pts[m].x += (Math.random() - 0.5) * amp
      pts[m].y += (Math.random() - 0.5) * amp
      pts[m].z += (Math.random() - 0.5) * amp * 0.5
      fill(i0, m, amp * 0.55)
      fill(m, i1, amp * 0.55)
    }
    fill(0, SEGS, len * 0.35)
  }

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const view = storyRef.current.view
    const w = Math.min(1, eraWeight(view, 2) + eraWeight(view, 3) * 0.7 + eraWeight(view, 5) * 0.8)
    const mask = maskRef.current
    const s = sampleEra(view, sample)
    beadMat.current.color.copy(s.eye)
    lineMat.current.color.copy(s.eye).lerp(new THREE.Color('#ffffff'), 0.6)

    const lp = lineGeo.attributes.position.array as Float32Array
    const bp = beadGeo.attributes.position.array as Float32Array
    let alive = 0
    bolts.forEach((b, k) => {
      if (b.life <= 0 && mask && mask.visible && w > 0.05 && Math.random() < dt * (1.4 + levelRef.current * 6) * w) {
        // spawn: from the mask's rim outward, a short leap through the air
        const sc = mask.scale.x
        const a = Math.random() * Math.PI * 2
        b.from.set(Math.cos(a) * 1.05 * sc, Math.sin(a) * 1.25 * sc, 0.1).add(mask.position)
        tmp.set(Math.cos(a + (Math.random() - 0.5) * 0.9), Math.sin(a + (Math.random() - 0.5) * 0.9), (Math.random() - 0.5) * 0.4)
        b.to.copy(b.from).addScaledVector(tmp, (0.9 + Math.random() * 1.6) * sc)
        b.ttl = 0.12 + Math.random() * 0.22
        b.life = b.ttl
        b.flick = 0
      }
      const base = k * SEGS * 6
      const bb = k * (SEGS + 1) * 3
      if (b.life > 0) {
        b.life -= dt
        b.flick -= dt
        if (b.flick <= 0) {
          b.flick = 0.035
          jag(b.from, b.to)
          for (let i = 0; i < SEGS; i++) {
            lp.set([pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z], base + i * 6)
          }
          for (let i = 0; i <= SEGS; i++) bp.set([pts[i].x, pts[i].y, pts[i].z], bb + i * 3)
        }
        alive++
      } else {
        // collapse dead bolts far away
        lp.fill(9999, base, base + SEGS * 6)
        bp.fill(9999, bb, bb + (SEGS + 1) * 3)
      }
    })
    lineGeo.attributes.position.needsUpdate = true
    beadGeo.attributes.position.needsUpdate = true
    const flicker = 0.6 + Math.random() * 0.4
    lineMat.current.opacity = alive ? flicker * w : 0
    beadMat.current.opacity = alive ? flicker * 0.8 * w : 0
  })

  return (
    <>
      <lineSegments geometry={lineGeo} material={lineMat.current} frustumCulled={false} />
      <points geometry={beadGeo} material={beadMat.current} frustumCulled={false} />
    </>
  )
}
