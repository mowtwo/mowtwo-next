import * as THREE from 'three'

type GearOpts = {
  teeth: number
  radius: number // pitch-ish outer radius (tooth tips)
  depth?: number // tooth depth as a fraction of radius
  hole?: number // centre hole radius
  spokes?: number // 0 = solid disc; otherwise cut this many windows
  thickness?: number
}

/** extruded spur gear with optional spoke windows — centred, lying in XY, extruded along +Z */
export function makeGearGeometry({ teeth, radius, depth = 0.12, hole = 0.18, spokes = 0, thickness = 0.12 }: GearOpts) {
  const root = radius * (1 - depth)
  const shape = new THREE.Shape()
  const step = (Math.PI * 2) / teeth
  // trapezoid teeth: root → flank up → tip → flank down
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    const pts: [number, number][] = [
      [root, a],
      [radius, a + step * 0.18],
      [radius, a + step * 0.42],
      [root, a + step * 0.6],
    ]
    pts.forEach(([r, ang], j) => {
      const x = Math.cos(ang) * r
      const y = Math.sin(ang) * r
      if (i === 0 && j === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    })
  }
  shape.closePath()

  const holeR = radius * hole
  const h = new THREE.Path()
  h.absarc(0, 0, holeR, 0, Math.PI * 2, true)
  shape.holes.push(h)

  if (spokes > 0) {
    const inner = holeR + radius * 0.12
    const outer = root - radius * 0.14
    const span = (Math.PI * 2) / spokes
    const spokeHalf = Math.min(span * 0.22, 0.35)
    for (let i = 0; i < spokes; i++) {
      const a0 = i * span + spokeHalf
      const a1 = (i + 1) * span - spokeHalf
      const w = new THREE.Path()
      w.absarc(0, 0, outer, a0, a1, false)
      w.absarc(0, 0, inner, a1, a0, true)
      w.closePath()
      shape.holes.push(w)
    }
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.18,
    bevelSize: radius * 0.012,
    bevelSegments: 2,
    curveSegments: 24,
  })
  geo.translate(0, 0, -thickness / 2)
  geo.computeVertexNormals()
  return geo
}
