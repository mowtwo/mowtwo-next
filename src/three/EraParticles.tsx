import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createEraSample, sampleEra } from '../story/eras'
import type { Story } from '../story/useStory'
import { seeded } from './random'

/**
 * One particle field for the whole film. The vertex shader computes four
 * behaviours and blends them by era, so the same points become:
 *   forge     embers rising from below, flickering
 *   clockwork slow, large, soft steam drifting up
 *   circuit   bits snapping along a grid, like packets on traces
 *   neural+   nodes floating on slow orbits (orbit / signal keep this)
 */
const vert = /* glsl */ `
uniform float uTime;
uniform float uEra;
uniform float uLevel;
uniform float uPixelRatio;
attribute vec4 aSeed;
varying float vAlpha;
varying float vSquare;

float w(float i) { return max(0.0, 1.0 - abs(uEra - i)); }

void main() {
  vec3 base = position;
  float t = uTime;
  float s = aSeed.x;

  // forge: embers rise and wrap, with a sideways wobble
  vec3 pF = base;
  pF.y = mod(base.y + 8.0 + t * (0.6 + s * 1.4), 16.0) - 8.0;
  pF.x += sin(t * (1.0 + s) + aSeed.y * 6.28) * 0.25;
  float aF = (0.55 + 0.45 * sin(t * (6.0 + s * 8.0) + aSeed.z * 20.0)) * smoothstep(8.0, 2.0, pF.y + 4.0);

  // clockwork: steam — slow rise, wide drift
  vec3 pC = base;
  pC.y = mod(base.y + 8.0 + t * (0.15 + s * 0.2), 16.0) - 8.0;
  pC.x += sin(t * 0.2 + aSeed.y * 6.28) * 1.2;
  float aC = 0.22;

  // circuit: snap to a grid and slide along one axis in steps
  vec3 pK = floor(base / 0.8) * 0.8;
  float lane = step(0.5, aSeed.w);
  float travel = fract(t * (0.25 + s * 0.5) + aSeed.y) * 6.4 - 3.2;
  // packets glide along grid lines: horizontal lanes move in x, vertical lanes in y
  pK.x += lane * travel;
  pK.y += (1.0 - lane) * travel;
  float aK = 0.8;

  // neural: slow orbits around their seed position
  vec3 pN = base + vec3(sin(t * 0.3 + s * 6.28), cos(t * 0.25 + aSeed.y * 6.28), sin(t * 0.2 + aSeed.z * 6.28)) * 0.6;
  float aN = 0.75;

  float wF = w(0.0), wC = w(1.0), wK = w(2.0), wN = clamp(uEra - 2.0, 0.0, 1.0);
  float total = wF + wC + wK + wN + 1e-4;
  vec3 p = (pF * wF + pC * wC + pK * wK + pN * wN) / total;
  vAlpha = (aF * wF + aC * wC + aK * wK + aN * wN) / total;
  vSquare = wK / total;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float size = mix(2.2, 9.0, wC / total) * (0.6 + s) * (1.0 + uLevel * 0.8);
  gl_PointSize = size * uPixelRatio * (8.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`

const frag = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
varying float vSquare;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float round = smoothstep(0.5, 0.0, length(c));
  float square = step(max(abs(c.x), abs(c.y)), 0.32);
  float a = mix(round, square, vSquare) * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor, a);
}
`

export default function EraParticles({ storyRef, levelRef }: { storyRef: React.MutableRefObject<Story>; levelRef: React.MutableRefObject<number> }) {
  const dpr = useThree((s) => s.viewport.dpr)
  const count = typeof window !== 'undefined' && window.innerWidth < 760 ? 1400 : 3200
  const sample = useMemo(() => createEraSample(), [])

  const geo = useMemo(() => {
    const rnd = seeded(11)
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd() - 0.5) * 22
      pos[i * 3 + 1] = (rnd() - 0.5) * 16
      pos[i * 3 + 2] = -rnd() * 12 + 1.5
      for (let j = 0; j < 4; j++) seed[i * 4 + j] = rnd()
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4))
    return g
  }, [count])

  const mat = useRef(
    new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uEra: { value: 0 },
        uLevel: { value: 0 },
        uPixelRatio: { value: 1 },
        uColor: { value: new THREE.Color() },
      },
    }),
  )

  useFrame(({ clock }) => {
    const u = mat.current.uniforms
    const era = storyRef.current.view
    u.uTime.value = clock.elapsedTime
    u.uEra.value = era
    u.uLevel.value = levelRef.current
    u.uPixelRatio.value = dpr
    u.uColor.value.copy(sampleEra(era, sample).particle)
  })

  return <points geometry={geo} material={mat.current} frustumCulled={false} />
}
