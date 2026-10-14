import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { eraWeight } from '../story/eras'
import type { Story } from '../story/useStory'
import { makeGearGeometry } from './gear'
import { seeded } from './random'

type StoryRef = React.MutableRefObject<Story>
type PointerRef = React.MutableRefObject<{ x: number; y: number }>
type LayerProps = { storyRef: StoryRef; pointerRef: PointerRef }

const PROPS_URL = '/models/m2-props.glb'
/** Blender-made props (blender/m2-world.blend): the forge anvil and a spine vertebra */
function useProp(name: 'Anvil' | 'Vertebra') {
  const { nodes } = useGLTF(PROPS_URL, '/draco/')
  return (nodes[name] as THREE.Mesh).geometry
}
useGLTF.preload(PROPS_URL, '/draco/')

/** vertical distance between era layers — scrolling one act "descends" this far */
const SPAN = 9

/**
 * Shared layer behaviour: fades with its era's weight, slides up as the story
 * moves past it (the camera seems to descend), and drifts with the pointer by
 * `depth` for parallax. `mats` get their opacity scaled by the weight.
 */
function useEraLayer(index: number, { storyRef, pointerRef }: LayerProps, depth: number, mats: THREE.Material[]) {
  const group = useRef<THREE.Group>(null)
  const weight = useRef(0)
  const base = useMemo(() => mats.map((m) => m.opacity), [mats])
  useFrame(() => {
    const g = group.current
    if (!g) return
    const e = storyRef.current.view
    const w = eraWeight(e, index)
    weight.current = w
    g.visible = w > 0.002
    if (!g.visible) return
    const p = pointerRef.current
    g.position.x = THREE.MathUtils.lerp(g.position.x, -p.x * 0.6 * depth, 0.05)
    g.position.y = (index - e) * SPAN + p.y * 0.35 * depth
    mats.forEach((m, i) => (m.opacity = base[i] * w))
  })
  return { group, weight }
}

/* ------------------------------------------------------------- I forge -- */

function Forge(props: LayerProps) {
  const ring = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ff6a1a', transparent: true, opacity: 0.9, toneMapped: false }),
    [],
  )
  const iron = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2a2420', metalness: 0.9, roughness: 0.7, flatShading: true, transparent: true }),
    [],
  )
  const glow = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    g.addColorStop(0, 'rgba(255,170,90,0.9)')
    g.addColorStop(0.35, 'rgba(255,90,20,0.35)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    return new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55 })
  }, [])
  const anvilGeo = useProp('Anvil')
  // phones: the anvil would sit right under the copy
  const narrow = useThree((s) => s.size.width / s.size.height < 0.8)
  const anvilMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1d1916', metalness: 0.92, roughness: 0.5, transparent: true }),
    [],
  )
  const ingot = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ff7a2a', transparent: true, toneMapped: false }), [])
  const mats = useMemo(() => [ring, iron, glow, anvilMat, ingot], [ring, iron, glow, anvilMat, ingot])
  const { group } = useEraLayer(0, props, 0.6, mats)

  // raw iron shards tumbling around the furnace — kept clear of the centre
  const shards = useMemo(
    () => {
      const rnd = seeded(7)
      return Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2 + rnd() * 0.3
        const r = 3.6 + rnd() * 3
        return {
          pos: new THREE.Vector3(Math.cos(a) * r * 1.4, Math.sin(a) * r * 0.75, -2 - rnd() * 5),
          scale: 0.15 + rnd() * 0.45,
          spin: new THREE.Vector3(rnd(), rnd(), rnd()).multiplyScalar(0.5),
        }
      })
    },
    [],
  )
  const shardRefs = useRef<(THREE.Mesh | null)[]>([])
  const ringRef = useRef<THREE.Mesh>(null)
  const anvilRef = useRef<THREE.Group>(null)

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    shardRefs.current.forEach((m, i) => {
      if (!m) return
      const s = shards[i]
      m.rotation.x += s.spin.x * dt
      m.rotation.y += s.spin.y * dt
      m.position.y = s.pos.y + Math.sin(t * 0.4 + i) * 0.2
    })
    // the anvil belongs to the film: it rises in when the mask wakes (and stays off phones)
    const a = anvilRef.current
    if (a) {
      const awake = 1 - props.storyRef.current.dormant
      a.visible = !narrow && awake > 0.02
      a.scale.setScalar(1.05 * awake)
      a.position.y = -3.25 - (1 - awake) * 0.8
    }
    // furnace flicker
    if (ringRef.current) ringRef.current.scale.setScalar(1 + Math.sin(t * 9) * 0.006 + Math.sin(t * 23) * 0.004)
  })

  return (
    <group ref={group}>
      <sprite material={glow} position={[0, 0, -3.2]} scale={[9, 9, 1]} />
      <mesh ref={ringRef} material={ring} position={[0, 0, -3]}>
        <torusGeometry args={[2.7, 0.035, 12, 160]} />
      </mesh>
      <mesh material={ring} position={[0, 0, -3.4]}>
        <torusGeometry args={[3.3, 0.012, 8, 160]} />
      </mesh>
      <group ref={anvilRef} position={[0.25, -3.25, -2.6]} rotation={[0.22, -0.35, 0]} scale={1.05}>
        <mesh geometry={anvilGeo} material={anvilMat} />
        {/* a bar of iron, still glowing from the furnace */}
        <mesh material={ingot} position={[0.1, 0.8, 0.02]} rotation={[0, 0.25, 0]}>
          <boxGeometry args={[0.7, 0.07, 0.09]} />
        </mesh>
      </group>
      {shards.map((s, i) => (
        <mesh key={i} ref={(m) => {
            shardRefs.current[i] = m
          }} material={iron} position={s.pos} scale={s.scale}>
          <icosahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
    </group>
  )
}

/* --------------------------------------------------------- II clockwork -- */

const GEARS = [
  // [x, y, z, radius, teeth, dir, spokes, dark]
  [-4.6, 1.6, -6.5, 3.2, 40, 1, 6, 0],
  [-0.9, 3.7, -7.5, 1.7, 21, -1, 5, 1],
  [4.4, 1.2, -6, 2.4, 30, 1, 5, 0],
  [5.6, -2.9, -5, 1.3, 16, -1, 4, 1],
  [-5.4, -3.2, -4.6, 1.5, 18, -1, 0, 1],
  [1.2, -4.4, -8, 2.8, 34, 1, 6, 0],
  [-2.4, -1.4, -9.5, 1.1, 14, -1, 4, 0],
] as const

function Clockwork(props: LayerProps) {
  const brass = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b8893a', metalness: 0.95, roughness: 0.34, transparent: true }), [])
  const bronze = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6e4a1e', metalness: 0.9, roughness: 0.45, transparent: true }), [])
  const mats = useMemo(() => [brass, bronze], [brass, bronze])
  const { group } = useEraLayer(1, props, 1, mats)
  const geos = useMemo(
    () => GEARS.map(([, , , r, teeth, , spokes]) => makeGearGeometry({ teeth, radius: r, spokes, thickness: 0.22, depth: 0.1 })),
    [],
  )
  const refs = useRef<(THREE.Mesh | null)[]>([])
  useFrame((_, dt) => {
    refs.current.forEach((m, i) => {
      // angular speed inversely proportional to tooth count, like meshing gears
      if (m) m.rotation.z += (GEARS[i][5] * 6 * dt) / GEARS[i][4]
    })
  })
  return (
    <group ref={group}>
      {GEARS.map(([x, y, z, , , , , dark], i) => (
        <mesh key={i} ref={(m) => {
            refs.current[i] = m
          }} geometry={geos[i]} material={dark ? bronze : brass} position={[x, y, z]} />
      ))}
    </group>
  )
}

/* ---------------------------------------------------------- III circuit -- */

const circuitFrag = /* glsl */ `
uniform float uTime;
uniform float uOpacity;
uniform vec3 uColor;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec2 g = vUv * vec2(30.0, 18.0);
  vec2 cell = floor(g);
  vec2 f = fract(g);
  float h = hash(cell);
  // each cell keeps either its horizontal or vertical trace (or none)
  float lineH = step(0.55, h) * smoothstep(0.06, 0.0, abs(f.y - 0.5));
  float lineV = step(h, 0.3) * smoothstep(0.06, 0.0, abs(f.x - 0.5));
  float pad = step(0.92, hash(cell + 7.0)) * smoothstep(0.18, 0.1, length(f - 0.5));
  float trace = max(max(lineH, lineV), pad);
  // current pulses running along the board
  float pulse = smoothstep(0.96, 1.0, fract((cell.x + cell.y) * 0.07 - uTime * 0.35 + h * 0.2));
  float a = trace * (0.18 + pulse * 0.9);
  gl_FragColor = vec4(uColor, a * uOpacity);
}
`

function Circuit(props: LayerProps) {
  const board = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: circuitFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uColor: { value: new THREE.Color('#39ffb0') } },
      }),
    [],
  )
  const chip = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0b1512', metalness: 0.7, roughness: 0.4, transparent: true }), [])
  const pin = useMemo(() => new THREE.MeshBasicMaterial({ color: '#b0623a', transparent: true }), [])
  const mats = useMemo(() => [chip, pin], [chip, pin])
  const { group, weight } = useEraLayer(2, props, 0.8, mats)
  useFrame(({ clock }) => {
    board.uniforms.uTime.value = clock.elapsedTime
    board.uniforms.uOpacity.value = weight.current
  })
  const chips = [
    [-4.2, 2.1, -5, 1.6, 1.1],
    [4.6, -1.8, -5.5, 1.2, 1.2],
    [3.6, 3, -6.5, 0.9, 0.6],
    [-3.4, -3, -6, 1.1, 0.8],
  ]
  return (
    <group ref={group}>
      <mesh material={board} position={[0, 0, -7]}>
        <planeGeometry args={[30, 18]} />
      </mesh>
      {chips.map(([x, y, z, w, h], i) => (
        <group key={i} position={[x, y, z]} rotation={[0.1 * i, -0.2 + 0.15 * i, 0]}>
          <mesh material={chip}>
            <boxGeometry args={[w, h, 0.18]} />
          </mesh>
          {Array.from({ length: 6 }, (_, k) => (
            <mesh key={k} material={pin} position={[-w / 2 + (w / 7) * (k + 1), -h / 2 - 0.08, 0]}>
              <boxGeometry args={[0.05, 0.16, 0.03]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/* ----------------------------------------------------------- IV neural -- */

function Neural(props: LayerProps) {
  const { nodes, lines } = useMemo(() => {
    const rnd = seeded(23)
    const pts: THREE.Vector3[] = []
    while (pts.length < 80) {
      const v = new THREE.Vector3((rnd() - 0.5) * 16, (rnd() - 0.5) * 9, -2 - rnd() * 7)
      if (Math.hypot(v.x, v.y) > 2.2) pts.push(v)
    }
    const seg: number[] = []
    pts.forEach((a, i) =>
      pts.forEach((b, j) => {
        if (j > i && a.distanceTo(b) < 2.4) seg.push(a.x, a.y, a.z, b.x, b.y, b.z)
      }),
    )
    const lg = new THREE.BufferGeometry()
    lg.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3))
    return { nodes: pts, lines: lg }
  }, [])
  const lineMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: '#5fe6ff', transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false }),
    [],
  )
  const nodeMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#bff6ff', transparent: true, toneMapped: false }), [])
  const mats = useMemo(() => [lineMat, nodeMat], [lineMat, nodeMat])
  const { group } = useEraLayer(3, props, 0.9, mats)
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    nodeRefs.current.forEach((m, i) => m && m.scale.setScalar(0.6 + Math.max(0, Math.sin(t * 1.5 + i * 1.7)) * 0.9))
  })
  return (
    <group ref={group}>
      <lineSegments geometry={lines} material={lineMat} />
      {nodes.map((p, i) => (
        <mesh key={i} ref={(m) => {
            nodeRefs.current[i] = m
          }} position={p} material={nodeMat}>
          <sphereGeometry args={[0.045, 8, 8]} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------- V orbit (spine only) -- */

function OrbitSpine(props: LayerProps) {
  const COUNT = 15
  const geo = useProp('Vertebra')
  // bronze at the bottom → violet crystal at the top: the whole film in one column
  const mats = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const t = i / (COUNT - 1)
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color('#7a4a24').lerp(new THREE.Color('#d8d0f0'), t),
          emissive: new THREE.Color('#8a4dff'),
          emissiveIntensity: t * t * 0.9,
          metalness: THREE.MathUtils.lerp(0.95, 0.5, t),
          roughness: THREE.MathUtils.lerp(0.5, 0.15, t),
          transparent: true,
        })
      }),
    [],
  )
  const { group } = useEraLayer(4, props, 0.4, mats)
  const refs = useRef<(THREE.Mesh | null)[]>([])
  useFrame((_, dt) => refs.current.forEach((m, i) => m && (m.rotation.y += (i % 2 ? -1 : 1) * dt * 0.4)))
  return (
    <group ref={group} position={[0, 0, -2]}>
      {mats.map((m, i) => (
        <mesh
          key={i}
          ref={(r) => {
            refs.current[i] = r
          }}
          geometry={geo}
          material={m}
          position={[0, -5.6 + i * 0.8, 0]}
          rotation={[0, i * 0.4, 0]}
        />
      ))}
    </group>
  )
}

/* ----------------------------------------------------------- VI signal -- */

function Signal(props: LayerProps) {
  const RINGS = 6
  const mats = useMemo(
    () =>
      Array.from(
        { length: RINGS },
        () => new THREE.MeshBasicMaterial({ color: '#8ff0ff', transparent: true, opacity: 0.6, toneMapped: false, depthWrite: false }),
      ),
    [],
  )
  const { group, weight } = useEraLayer(5, props, 0.3, mats)
  const refs = useRef<(THREE.Mesh | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    refs.current.forEach((m, i) => {
      if (!m) return
      const k = (t * 0.25 + i / RINGS) % 1
      m.scale.setScalar(0.4 + k * 7)
      mats[i].opacity = (1 - k) * 0.55 * weight.current
    })
  })
  return (
    <group ref={group} position={[0, 0.6, -1.5]}>
      {mats.map((m, i) => (
        <mesh key={i} ref={(r) => {
            refs.current[i] = r
          }} material={m}>
          <torusGeometry args={[1, 0.008, 6, 128]} />
        </mesh>
      ))}
    </group>
  )
}

export default function EraProps(props: LayerProps) {
  return (
    <>
      <Forge {...props} />
      <Clockwork {...props} />
      <Circuit {...props} />
      <Neural {...props} />
      <OrbitSpine {...props} />
      <Signal {...props} />
    </>
  )
}
