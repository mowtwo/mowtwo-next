/**
 * Generative score — 100% procedural, no audio files, loops forever.
 *
 * An original piece for "cathedral organ + ticking piano": slow sustained organ
 * chords (additive drawbar synthesis over a 16' pedal), a pendulum-like piano
 * ostinato in eighth notes, a faint clock tick, all in a long generated
 * reverb. The harmony is an original 8-bar loop in A minor that re-voices a
 * little every cycle so the loop never sounds stamped.
 *
 * Signal graph:
 *   organ / pedal / piano / tick
 *     -> voiceBus -> masterFilter (the "underwater" low-pass)
 *     -> convolver reverb (wet) + dry -> analyser -> masterGain -> destination
 *
 * Interactive hooks used by the site (unchanged API):
 *   toggle()            start / stop with a fade
 *   setUnderwater(bool) muffles everything (open a project)
 *   setIntensity(0..1)  story depth → brighter organ, clearer ostinato, shimmer
 *   level (0..1)        live RMS, drives the mask's glow
 */

const BPM = 80
const EIGHTH = 60 / BPM / 2
const BAR = EIGHTH * 8
const A = 220 // A3

const hz = (semi: number) => A * Math.pow(2, semi / 12)

/**
 * Chords as semitones from A3. Original progression:
 *   Am(add9) · Fmaj7 · C/E · G6 · Am · Dm9 · Fmaj7(#11) · Esus4 → E
 */
const CHORDS: { pedal: number; tones: number[] }[] = [
  { pedal: -24, tones: [0, 3, 7, 14] },
  { pedal: -28, tones: [-4, 0, 3, 7] },
  { pedal: -29, tones: [-5, 3, 7, 10] },
  { pedal: -26, tones: [-2, 2, 5, 9] },
  { pedal: -24, tones: [0, 3, 7, 12] },
  { pedal: -31, tones: [-7, 0, 3, 7] },
  { pedal: -28, tones: [-4, 0, 6, 7] },
  { pedal: -29, tones: [-5, 2, 7, 11] },
]

/** ostinato figure per bar: indexes into an upper voicing of the chord (pendulum shape) */
const FIGURE = [0, 2, 1, 2, 0, 2, 1, 3]

/** organ drawbars: harmonic multiple → level */
const DRAWBARS: [number, number][] = [
  [1, 1],
  [2, 0.55],
  [3, 0.28],
  [4, 0.18],
]

export class AudioEngine {
  ctx: AudioContext | null = null
  private masterGain!: GainNode
  private masterFilter!: BiquadFilterNode
  private voiceBus!: GainNode
  private organBus!: GainNode
  private pianoBus!: GainNode
  private shimmerBus!: GainNode
  private analyser!: AnalyserNode
  private reverbGain!: GainNode
  private tremolo!: OscillatorNode

  private schedulerId: number | null = null
  private nextTime = 0
  private eighth = 0 // running eighth-note counter
  private levelRaf = 0
  private buf!: Uint8Array<ArrayBuffer>

  running = false
  private underwater = false
  private intensity = 0.2
  level = 0

  // --- lifecycle ---
  private ensure() {
    if (this.ctx) return
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AC()
    this.ctx = ctx

    this.masterGain = ctx.createGain()
    this.masterGain.gain.value = 0
    this.masterGain.connect(ctx.destination)

    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 256
    this.buf = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount))
    this.analyser.connect(this.masterGain)

    this.masterFilter = ctx.createBiquadFilter()
    this.masterFilter.type = 'lowpass'
    this.masterFilter.frequency.value = this.openCutoff()
    this.masterFilter.Q.value = 0.6

    // long cathedral reverb
    const verb = ctx.createConvolver()
    verb.buffer = this.impulse(6.5, 2.6)
    this.reverbGain = ctx.createGain()
    this.reverbGain.gain.value = 0.55
    const dry = ctx.createGain()
    dry.gain.value = 0.7

    this.voiceBus = ctx.createGain()
    this.voiceBus.connect(this.masterFilter)
    this.masterFilter.connect(dry)
    this.masterFilter.connect(verb)
    verb.connect(this.reverbGain)
    dry.connect(this.analyser)
    this.reverbGain.connect(this.analyser)

    // organ through a slow tremolo (a breathing pipe sound)
    this.organBus = ctx.createGain()
    this.organBus.gain.value = 0.16
    const trem = ctx.createGain()
    trem.gain.value = 0.9
    this.tremolo = ctx.createOscillator()
    this.tremolo.frequency.value = 4.6
    const tremDepth = ctx.createGain()
    tremDepth.gain.value = 0.06
    this.tremolo.connect(tremDepth).connect(trem.gain)
    this.tremolo.start()
    this.organBus.connect(trem).connect(this.voiceBus)

    this.pianoBus = ctx.createGain()
    this.pianoBus.gain.value = 0.1
    this.pianoBus.connect(this.voiceBus)

    this.shimmerBus = ctx.createGain()
    this.shimmerBus.gain.value = 0
    this.shimmerBus.connect(this.voiceBus)

    this.applyIntensity(0)
  }

  /** stereo noise impulse with an exponential tail */
  private impulse(seconds: number, decay: number) {
    const ctx = this.ctx!
    const len = Math.floor(ctx.sampleRate * seconds)
    const buf = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
    }
    return buf
  }

  private openCutoff() {
    return 2200 + this.intensity * 5200
  }

  // --- voices ---

  /** one organ pipe rank for a chord tone: drawbar sines, a hair detuned, slow swell */
  private organTone(freq: number, t: number, dur: number, gain: number) {
    const ctx = this.ctx!
    const env = ctx.createGain()
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(gain, t + 1.6)
    env.gain.setValueAtTime(gain, t + dur)
    env.gain.linearRampToValueAtTime(0, t + dur + 2.4)
    env.connect(this.organBus)
    const bright = 0.35 + this.intensity * 0.65 // upper drawbars open with the story
    for (const [mult, lvl] of DRAWBARS) {
      for (const detune of [-3, 3]) {
        const o = ctx.createOscillator()
        o.type = 'sine'
        o.frequency.value = freq * mult
        o.detune.value = detune
        const g = ctx.createGain()
        g.gain.value = (mult === 1 ? lvl : lvl * bright) * 0.5
        o.connect(g).connect(env)
        o.start(t)
        o.stop(t + dur + 2.6)
      }
    }
  }

  /** soft felt-piano note: sine + octave partial, quick attack, long natural decay */
  private piano(freq: number, t: number, vel: number) {
    const ctx = this.ctx!
    const env = ctx.createGain()
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(vel, t + 0.008)
    env.gain.exponentialRampToValueAtTime(vel * 0.35, t + 0.35)
    env.gain.exponentialRampToValueAtTime(0.0001, t + 2.6)
    env.connect(this.pianoBus)
    const partials: [number, number, OscillatorType][] = [
      [1, 1, 'sine'],
      [2, 0.22, 'sine'],
      [3, 0.06, 'triangle'],
    ]
    for (const [m, g, type] of partials) {
      const o = ctx.createOscillator()
      o.type = type
      o.frequency.value = freq * m
      const pg = ctx.createGain()
      pg.gain.value = g
      o.connect(pg).connect(env)
      o.start(t)
      o.stop(t + 2.7)
    }
  }

  /** the escapement: a tiny filtered click */
  private tick(t: number, accent: boolean) {
    const ctx = this.ctx!
    const len = Math.floor(ctx.sampleRate * 0.03)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6)
    const src = ctx.createBufferSource()
    src.buffer = buf
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = accent ? 3200 : 4200
    bp.Q.value = 6
    const g = ctx.createGain()
    g.gain.value = accent ? 0.05 : 0.03
    src.connect(bp).connect(g).connect(this.voiceBus)
    src.start(t)
  }

  /** a high, glassy octave line that appears late in the story */
  private shimmer(freq: number, t: number, dur: number) {
    const ctx = this.ctx!
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = freq
    const env = ctx.createGain()
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(0.12, t + dur * 0.4)
    env.gain.linearRampToValueAtTime(0, t + dur)
    o.connect(env).connect(this.shimmerBus)
    o.start(t)
    o.stop(t + dur + 0.1)
  }

  // --- sequencing ---

  private scheduleEighth(n: number, t: number) {
    const barIndex = Math.floor(n / 8)
    const pos = n % 8
    const cycle = Math.floor(barIndex / CHORDS.length)
    const chord = CHORDS[barIndex % CHORDS.length]

    if (pos === 0) {
      // organ chord for the whole bar (overlaps into the next through its release)
      const lift = cycle % 2 ? 12 : 0 // every other cycle the top voice moves up an octave
      chord.tones.forEach((s, i) => this.organTone(hz(s + (i === chord.tones.length - 1 ? lift : 0)), t, BAR, 0.22))
      this.organTone(hz(chord.pedal), t, BAR, 0.3) // 16' pedal
      if (this.intensity > 0.45) this.shimmer(hz(chord.tones[2] + 24), t, BAR * 1.2)
    }

    // the pendulum: an upper voicing of the chord, one note per eighth
    const upper = chord.tones.map((s) => s + 12).sort((a, b) => a - b)
    const idx = FIGURE[(pos + (cycle % 3 === 2 ? 4 : 0)) % 8] // the figure turns over every third cycle
    const accent = pos % 2 === 0
    const vel = (accent ? 0.9 : 0.62) * (0.55 + this.intensity * 0.45)
    this.piano(hz(upper[idx % upper.length]), t, vel)
    this.tick(t, accent)
  }

  private scheduler = () => {
    const ctx = this.ctx!
    while (this.nextTime < ctx.currentTime + 0.2) {
      this.scheduleEighth(this.eighth, this.nextTime)
      this.eighth++
      this.nextTime += EIGHTH
    }
  }

  private measureLevel = () => {
    this.analyser.getByteTimeDomainData(this.buf)
    let sum = 0
    for (let i = 0; i < this.buf.length; i++) {
      const v = (this.buf[i] - 128) / 128
      sum += v * v
    }
    const rms = Math.min(1, Math.sqrt(sum / this.buf.length) * 4)
    this.level += (rms - this.level) * 0.25
    this.levelRaf = requestAnimationFrame(this.measureLevel)
  }

  private applyIntensity(rampSeconds: number) {
    if (!this.ctx) return
    const now = this.ctx.currentTime
    const tc = Math.max(0.01, rampSeconds)
    if (!this.underwater) this.masterFilter.frequency.setTargetAtTime(this.openCutoff(), now, tc)
    this.pianoBus.gain.setTargetAtTime(0.08 + this.intensity * 0.07, now, tc)
    this.shimmerBus.gain.setTargetAtTime(Math.max(0, this.intensity - 0.4) * 0.6, now, tc)
  }

  // --- public controls ---
  toggle(): boolean {
    this.ensure()
    const ctx = this.ctx!
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime
    this.running = !this.running
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now)
    this.masterGain.gain.linearRampToValueAtTime(this.running ? 0.7 : 0, now + (this.running ? 2.5 : 0.8))

    if (this.running) {
      this.nextTime = ctx.currentTime + 0.15
      this.eighth = 0
      this.schedulerId = window.setInterval(this.scheduler, 40)
      this.measureLevel()
    } else if (this.schedulerId) {
      window.clearInterval(this.schedulerId)
      this.schedulerId = null
      cancelAnimationFrame(this.levelRaf)
      this.level = 0
    }
    return this.running
  }

  setUnderwater(on: boolean) {
    this.underwater = on
    if (!this.ctx) return
    const now = this.ctx.currentTime
    this.masterFilter.frequency.setTargetAtTime(on ? 420 : this.openCutoff(), now, 0.3)
    this.masterFilter.Q.setTargetAtTime(on ? 5 : 0.6, now, 0.3)
    this.reverbGain.gain.setTargetAtTime(on ? 0.8 : 0.55, now, 0.3)
  }

  setIntensity(v: number) {
    this.intensity = Math.max(0, Math.min(1, v))
    this.applyIntensity(1.2)
  }

  dispose() {
    if (this.schedulerId) window.clearInterval(this.schedulerId)
    cancelAnimationFrame(this.levelRaf)
    this.ctx?.close()
    this.ctx = null
  }
}

// module singleton
export const audioEngine = new AudioEngine()
