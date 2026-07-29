import './style.css'
import * as THREE from 'three'

type Skill = {
  label: string
  value: number
  color: string
}

type Project = {
  name: string
  url: string
  links?: {
    label: string
    zhLabel: string
    url: string
  }[]
  meta: string
  description: string
  zhMeta: string
  zhDescription: string
}

type Locale = 'en' | 'zh'

const skills: Skill[] = [
  { label: 'TypeScript', value: 99, color: '#38bdf8' },
  { label: 'Python', value: 86, color: '#facc15' },
  { label: 'FastAPI', value: 82, color: '#2dd4bf' },
  { label: 'React', value: 92, color: '#60a5fa' },
  { label: 'Next.js', value: 88, color: '#f8fafc' },
  { label: 'RAG', value: 78, color: '#c084fc' },
  { label: 'Agent', value: 78, color: '#f472b6' },
  { label: 'AWS', value: 80, color: '#fb923c' },
  { label: 'Terraform', value: 74, color: '#a78bfa' },
  { label: 'WebGL', value: 76, color: '#34d399' },
]

const projects: Project[] = [
  {
    name: 'tu',
    url: 'https://github.com/mowtwo/tu',
    meta: 'TypeScript · Responsive UI Language',
    description:
      'A declarative UI language experiment with trailing-closure DSL, scoped styles, TC39 Signals-style reactivity, and language tooling ideas.',
    zhMeta: 'TypeScript · 响应式 UI 语言',
    zhDescription:
      '一个声明式 UI 语言实验，包含 trailing-closure DSL、作用域样式、TC39 Signals 风格响应式模型，以及语言工具链探索。',
  },
  {
    name: 'giggle-lab',
    url: 'https://github.com/mowtwo/giggle-lab',
    meta: 'TypeScript / WebGL · Creative Frontend Lab',
    description:
      'A personal playground for interactive frontend experiments, including Canvas, Three.js/WebGL visuals, media processing, and browser-native ideas.',
    zhMeta: 'TypeScript / WebGL · 创意前端实验室',
    zhDescription:
      '个人交互前端实验场，包含 Canvas、Three.js/WebGL 视觉、媒体处理和浏览器原生能力探索。',
  },
  {
    name: 'enterprise-context-layer',
    url: 'https://github.com/mowtwo/enterprise-context-web',
    links: [
      {
        label: 'Frontend',
        zhLabel: '前端',
        url: 'https://github.com/mowtwo/enterprise-context-web',
      },
      {
        label: 'API',
        zhLabel: '后端',
        url: 'https://github.com/mowtwo/enterprise-context-api',
      },
    ],
    meta: 'React / FastAPI / pgvector · AI Full-stack Demo',
    description:
      'A local-first RAG product demo with file ingestion, citations, retrieval debug, audit logs, Docker deployment, and swappable embedding/chat providers.',
    zhMeta: 'React / FastAPI / pgvector · AI 全栈 Demo',
    zhDescription:
      '一个本地优先的 RAG 产品 demo，包含文件导入、引用来源、检索调试、审计日志、Docker 部署，以及可切换的 embedding/chat provider。',
  },
]

const copy = {
  en: {
    sceneLabel: 'M2 interactive WebGL skill playground',
    navLabel: 'Main navigation',
    github: 'GitHub',
    cv: 'CV',
    projects: 'Projects',
    langToggle: '中文',
    langLabel: 'Switch to Chinese',
    eyebrow: 'AI Full-stack Engineer · China Remote',
    subtitle: 'React / FastAPI / RAG / Agent infrastructure, built with startup-speed ownership.',
    desktopHint: 'Click anywhere or press Space',
    mobileHint: 'Tap anywhere',
    hintSuffix: 'to launch skill spheres',
    closeCv: 'Close CV',
    closeProjects: 'Close Projects',
    cvTitle: 'Chen Wencheng · AI Full-stack Engineer',
    profileTitle: 'Profile',
    profileOne:
      'Founding-stage core developer at Tiantian Intelligence, building an AI imaging platform for cross-border commerce customers including SHEIN and Unifi3D.',
    profileTwo:
      '5+ years in software engineering, spanning product frontend, Python/FastAPI backend, RAG/vector search, agent workflows, async workers, AWS/Terraform infrastructure, and CI/CD.',
    focusTitle: 'Current Focus',
    focusOne: 'AI application backend and model orchestration across OpenAI, Anthropic, Gemini, and Fal.ai.',
    focusTwo: 'SQS/ECS async generation pipelines, webhook state machines, streaming feedback, and cost metering.',
    focusThree:
      'Enterprise-ready details: Stripe metering, KMS credential encryption, audit-friendly records, and multi-environment deployments.',
    remoteTitle: 'Remote Work',
    remoteBody:
      'Based in Fuzhou, China. Comfortable with East Asia timezone collaboration, written English communication, async updates, and high-ownership remote delivery.',
    projectsKicker: 'Projects',
    projectsTitle: 'Core GitHub Projects',
    viewRepo: 'View repository',
    credit: 'Built with Codex · © M2',
  },
  zh: {
    sceneLabel: 'M2 交互式 WebGL 技能球场',
    navLabel: '主导航',
    github: 'GitHub',
    cv: '简历',
    projects: '项目',
    langToggle: 'EN',
    langLabel: '切换到英文',
    eyebrow: 'AI 全栈开发工程师 · 中国远程',
    subtitle: 'React / FastAPI / RAG / Agent 基础设施，用创业团队节奏构建产品。',
    desktopHint: '点击任意位置或按空格',
    mobileHint: '点击屏幕',
    hintSuffix: '发射技能球',
    closeCv: '关闭简历',
    closeProjects: '关闭项目',
    cvTitle: '陈文程 · AI 全栈开发工程师',
    profileTitle: '个人定位',
    profileOne:
      '天天智能创始阶段核心开发之一，正在构建面向 SHEIN、Unifi3D 等跨境电商客户的 AI 影像平台。',
    profileTwo:
      '5 年以上软件研发经验，覆盖产品前端、Python/FastAPI 后端、RAG/向量搜索、Agent workflow、异步 worker、AWS/Terraform 基础设施和 CI/CD。',
    focusTitle: '当前重点',
    focusOne: 'AI 应用后端，以及 OpenAI、Anthropic、Gemini、Fal.ai 等多模型编排。',
    focusTwo: 'SQS/ECS 异步生成流水线、webhook 状态机、流式反馈和成本计量。',
    focusThree: '企业级细节：Stripe 计量计费、KMS 凭据加密、审计友好记录和多环境部署。',
    remoteTitle: '远程协作',
    remoteBody:
      '位于中国福州。熟悉东亚时区协作、英文文字沟通、异步进展同步，以及高 ownership 的远程交付方式。',
    projectsKicker: '项目',
    projectsTitle: '核心 GitHub 项目',
    viewRepo: '查看仓库',
    credit: 'Built with Codex · © M2',
  },
} as const

function getInitialLanguage(): Locale {
  const stored = window.localStorage.getItem('m2-language')
  return stored === 'zh' ? 'zh' : 'en'
}

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) {
  throw new Error('Missing #app root')
}

app.innerHTML = `
  <canvas id="scene" aria-label="M2 interactive WebGL skill playground"></canvas>
  <main class="surface" aria-live="polite">
    <nav class="nav" aria-label="Main navigation">
      <a class="nav-link" href="https://github.com/mowtwo" target="_blank" rel="noreferrer" data-i18n="github">GitHub</a>
      <a class="nav-link" href="#cv" data-i18n="cv">CV</a>
      <a class="nav-link" href="#projects" data-i18n="projects">Projects</a>
      <button class="nav-link lang-toggle" type="button" data-i18n="langToggle" aria-label="Switch to Chinese">中文</button>
    </nav>

    <section class="hero" id="home">
      <p class="eyebrow" data-i18n="eyebrow">AI Full-stack Engineer · China Remote</p>
      <h1>M2</h1>
      <p class="subtitle" data-i18n="subtitle">React / FastAPI / RAG / Agent infrastructure, built with startup-speed ownership.</p>
      <div class="hint">
        <span class="desktop-hint" data-i18n="desktopHint">Click anywhere or press Space</span>
        <span class="mobile-hint" data-i18n="mobileHint">Tap anywhere</span>
        <span data-i18n="hintSuffix">to launch skill spheres</span>
      </div>
    </section>

    <section class="panel" id="cv-panel" aria-labelledby="cv-title">
      <a class="close" href="/" aria-label="Close CV" data-close-panel data-i18n-aria="closeCv">×</a>
      <p class="panel-kicker" data-i18n="cv">CV</p>
      <h2 id="cv-title" data-i18n="cvTitle">Chen Wencheng · AI Full-stack Engineer</h2>
      <div class="cv-grid">
        <article>
          <h3 data-i18n="profileTitle">Profile</h3>
          <p data-i18n="profileOne">Founding-stage core developer at Tiantian Intelligence, building an AI imaging platform for cross-border commerce customers including SHEIN and Unifi3D.</p>
          <p data-i18n="profileTwo">5+ years in software engineering, spanning product frontend, Python/FastAPI backend, RAG/vector search, agent workflows, async workers, AWS/Terraform infrastructure, and CI/CD.</p>
        </article>
        <article>
          <h3 data-i18n="focusTitle">Current Focus</h3>
          <ul>
            <li data-i18n="focusOne">AI application backend and model orchestration across OpenAI, Anthropic, Gemini, and Fal.ai.</li>
            <li data-i18n="focusTwo">SQS/ECS async generation pipelines, webhook state machines, streaming feedback, and cost metering.</li>
            <li data-i18n="focusThree">Enterprise-ready details: Stripe metering, KMS credential encryption, audit-friendly records, and multi-environment deployments.</li>
          </ul>
        </article>
        <article>
          <h3 data-i18n="remoteTitle">Remote Work</h3>
          <p data-i18n="remoteBody">Based in Fuzhou, China. Comfortable with East Asia timezone collaboration, written English communication, async updates, and high-ownership remote delivery.</p>
        </article>
      </div>
    </section>

    <section class="panel" id="projects-panel" aria-labelledby="projects-title">
      <a class="close" href="/" aria-label="Close Projects" data-close-panel data-i18n-aria="closeProjects">×</a>
      <p class="panel-kicker" data-i18n="projectsKicker">Projects</p>
      <h2 id="projects-title" data-i18n="projectsTitle">Core GitHub Projects</h2>
      <div class="project-list">
        ${projects
          .map(
            (project) => `
              <article class="project-card" data-project="${project.name}">
                <div>
                  <h3>${project.name}</h3>
                  <p class="project-meta" data-project-field="meta">${project.meta}</p>
                  <p data-project-field="description">${project.description}</p>
                </div>
                <div class="project-links">
                  ${(project.links ?? [{ label: 'Repository', zhLabel: '仓库', url: project.url }])
                    .map(
                      (link) => `
                        <a href="${link.url}" target="_blank" rel="noreferrer" data-link-label="${link.label}" data-link-zh-label="${link.zhLabel}">${link.label}</a>
                      `,
                    )
                    .join('')}
                </div>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>

    <footer class="credit" data-i18n="credit">Built with Codex · © M2</footer>
  </main>
`

let currentLanguage = getInitialLanguage()

function applyLanguage(language: Locale) {
  currentLanguage = language
  window.localStorage.setItem('m2-language', language)
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
  document.body.dataset.lang = language

  const dictionary = copy[language]
  document.querySelector<HTMLCanvasElement>('#scene')?.setAttribute('aria-label', dictionary.sceneLabel)
  document.querySelector<HTMLElement>('.nav')?.setAttribute('aria-label', dictionary.navLabel)

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n as keyof typeof dictionary
    element.textContent = dictionary[key]
  })

  document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((element) => {
    const key = element.dataset.i18nAria as keyof typeof dictionary
    element.setAttribute('aria-label', dictionary[key])
  })

  document.querySelector<HTMLButtonElement>('.lang-toggle')?.setAttribute('aria-label', dictionary.langLabel)

  projects.forEach((project) => {
    const card = document.querySelector<HTMLElement>(`[data-project="${project.name}"]`)
    if (!card) return
    const meta = card.querySelector<HTMLElement>('[data-project-field="meta"]')
    const description = card.querySelector<HTMLElement>('[data-project-field="description"]')
    if (meta) meta.textContent = language === 'zh' ? project.zhMeta : project.meta
    if (description) description.textContent = language === 'zh' ? project.zhDescription : project.description
    card.querySelectorAll<HTMLAnchorElement>('[data-link-label]').forEach((link) => {
      link.textContent = language === 'zh' ? link.dataset.linkZhLabel || '' : link.dataset.linkLabel || ''
    })
  })
}

document.querySelector<HTMLButtonElement>('.lang-toggle')?.addEventListener('click', () => {
  applyLanguage(currentLanguage === 'en' ? 'zh' : 'en')
})

applyLanguage(currentLanguage)

const canvas = document.querySelector<HTMLCanvasElement>('#scene')
if (!canvas) {
  throw new Error('Missing WebGL canvas')
}

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'default',
})
const maxPixelRatio = window.innerWidth < 720 ? 1.15 : 1.35
renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio))
renderer.outputColorSpace = THREE.SRGBColorSpace

const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2('#070812', 0.026)

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 140)
camera.position.set(0, 0, 28)

const ambient = new THREE.AmbientLight('#b9d7ff', 1.2)
const key = new THREE.DirectionalLight('#ffffff', 2.8)
key.position.set(8, 11, 13)
const rim = new THREE.PointLight('#7dd3fc', 22, 58)
rim.position.set(-14, 6, 9)
scene.add(ambient, key, rim)

const world = new THREE.Group()
const particleGroup = new THREE.Group()
const starGroup = new THREE.Group()
scene.add(world, particleGroup, starGroup)

const bounds = new THREE.Vector3(13, 8, 7)
const pointer = new THREE.Vector2()
const pointerTarget = new THREE.Vector2()
const raycaster = new THREE.Raycaster()
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
const spawnPoint = new THREE.Vector3()
const clock = new THREE.Clock()
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
const sphereGeometryCache = new Map<string, THREE.SphereGeometry>()
const sparkGeometry = new THREE.SphereGeometry(1, 8, 6)
const targetFrameMs = 1000 / 42
let lastRenderedAt = 0

type WallKey = 'back' | 'front' | 'left' | 'right' | 'floor' | 'ceiling'
type WallFlashPatch = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  life: number
  maxLife: number
}

const wallFlashGeometry = new THREE.PlaneGeometry(4.8, 4.8)
const wallFlashTexture = createWallFlashTexture()
const wallFlashes: WallFlashPatch[] = []

function getSphereGeometry(radius: number) {
  const key = radius.toFixed(2)
  const cached = sphereGeometryCache.get(key)
  if (cached) return cached
  const geometry = new THREE.SphereGeometry(radius, 32, 20)
  sphereGeometryCache.set(key, geometry)
  return geometry
}

class SkillSphere {
  group: THREE.Group
  mesh: THREE.Mesh
  label: THREE.Sprite
  velocity: THREE.Vector3
  radius: number
  bounceCount = 0
  maxBounces: number
  active = true

  constructor(position: THREE.Vector3, skill: Skill) {
    this.radius = THREE.MathUtils.clamp(skill.value / 42, 1.35, 2.35) * (isMobile ? 0.78 : 1)
    this.group = new THREE.Group()
    this.group.position.copy(position)
    const geometry = getSphereGeometry(this.radius)
    const material = new THREE.MeshPhysicalMaterial({
      color: skill.color,
      roughness: 0.28,
      metalness: 0.18,
      clearcoat: 0.55,
      clearcoatRoughness: 0.22,
      emissive: new THREE.Color(skill.color).multiplyScalar(0.18),
    })
    this.mesh = new THREE.Mesh(geometry, material)
    this.group.add(this.mesh)
    this.label = createLabelSprite(skill.label, this.radius)
    this.label.position.set(0, 0, this.radius + 0.08)
    this.group.add(this.label)

    const angle = Math.random() * Math.PI * 2
    const z = (Math.random() - 0.5) * 1.7
    const speed = 7 + Math.random() * 3.5
    this.velocity = new THREE.Vector3(Math.cos(angle), Math.sin(angle), z).normalize().multiplyScalar(speed)
    this.maxBounces = Math.floor(Math.random() * 3) + 8
    world.add(this.group)
  }

  update(delta: number) {
    if (!this.active) return
    this.group.position.addScaledVector(this.velocity, delta)
    this.mesh.rotation.x += delta * this.velocity.y * 0.38
    this.mesh.rotation.y += delta * this.velocity.x * 0.38

    this.reflectAxis('x', bounds.x)
    this.reflectAxis('y', bounds.y)
    this.reflectAxis('z', bounds.z)
  }

  reflectAxis(axis: 'x' | 'y' | 'z', limit: number) {
    const value = this.group.position[axis]
    const edge = limit - this.radius
    if (value < -edge) {
      this.group.position[axis] = -edge
      this.velocity[axis] *= -1
      triggerWallFlash(
        axis === 'x' ? 'left' : axis === 'y' ? 'floor' : 'back',
        this.group.position,
        (this.mesh.material as THREE.MeshPhysicalMaterial).color,
      )
      this.bounce()
    } else if (value > edge) {
      this.group.position[axis] = edge
      this.velocity[axis] *= -1
      triggerWallFlash(
        axis === 'x' ? 'right' : axis === 'y' ? 'ceiling' : 'front',
        this.group.position,
        (this.mesh.material as THREE.MeshPhysicalMaterial).color,
      )
      this.bounce()
    }
  }

  bounce() {
    this.bounceCount += 1
    this.mesh.scale.setScalar(1.08)
    setTimeout(() => this.mesh.scale.setScalar(1), 70)
    if (this.bounceCount >= this.maxBounces) {
      this.active = false
    }
  }

  dispose() {
    world.remove(this.group)
    ;(this.mesh.material as THREE.Material).dispose()
    this.label.material.map?.dispose()
    this.label.material.dispose()
  }
}

class Spark {
  mesh: THREE.Mesh
  velocity: THREE.Vector3
  life = 1

  constructor(position: THREE.Vector3, color: THREE.ColorRepresentation) {
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.95,
    })
    this.mesh = new THREE.Mesh(sparkGeometry, material)
    this.mesh.scale.setScalar(0.08 + Math.random() * 0.12)
    this.mesh.position.copy(position)
    this.velocity = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5,
    )
      .normalize()
      .multiplyScalar(6 + Math.random() * 7)
    particleGroup.add(this.mesh)
  }

  update(delta: number) {
    this.mesh.position.addScaledVector(this.velocity, delta)
    this.velocity.multiplyScalar(0.985)
    this.life -= delta * 1.18
    ;(this.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(this.life, 0)
  }

  dispose() {
    particleGroup.remove(this.mesh)
    ;(this.mesh.material as THREE.Material).dispose()
  }
}

const spheres: SkillSphere[] = []
const sparks: Spark[] = []
let lastIdleSpawn = 0
const collisionNormal = new THREE.Vector3()
const relativeVelocity = new THREE.Vector3()

function createLabelSprite(text: string, radius: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = '700 64px Inter, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(5, 9, 18, 0.68)'
  roundRect(ctx, 40, 70, 432, 116, 58)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.fillText(text, 256, 130, 390)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(radius * 2.35, radius * 1.15, 1)
  return sprite
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function createWallFlashTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')

  const gradient = ctx.createRadialGradient(128, 128, 18, 128, 128, 128)
  gradient.addColorStop(0, 'rgba(255,255,255,0.95)')
  gradient.addColorStop(0.28, 'rgba(183,251,255,0.58)')
  gradient.addColorStop(0.62, 'rgba(72,211,255,0.18)')
  gradient.addColorStop(1, 'rgba(72,211,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)

  ctx.strokeStyle = 'rgba(212,252,255,0.48)'
  ctx.lineWidth = 2
  for (let i = 32; i <= 224; i += 32) {
    ctx.beginPath()
    ctx.moveTo(i, 36)
    ctx.lineTo(i, 220)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(36, i)
    ctx.lineTo(220, i)
    ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.72)'
  ctx.lineWidth = 4
  ctx.strokeRect(48, 48, 160, 160)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function buildStars() {
  const geometry = new THREE.BufferGeometry()
  const count = 420
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 90
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60
    positions[i * 3 + 2] = -28 - Math.random() * 45
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({
    color: '#dbeafe',
    size: 0.06,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
  })
  starGroup.add(new THREE.Points(geometry, material))
}

function buildFrame() {
  const geometry = new THREE.BoxGeometry(bounds.x * 2, bounds.y * 2, bounds.z * 2)
  const edges = new THREE.EdgesGeometry(geometry)
  const material = new THREE.LineBasicMaterial({ color: '#9cf4ff', transparent: true, opacity: 0.58 })
  const frame = new THREE.LineSegments(edges, material)
  world.add(frame)
  geometry.dispose()

  const wallMaterial = new THREE.LineBasicMaterial({
    color: '#9cf4ff',
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  })
  const sideMaterial = new THREE.LineBasicMaterial({
    color: '#9cf4ff',
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  })
  const panelMaterial = new THREE.MeshBasicMaterial({
    color: '#123e5e',
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  world.add(createWallPanel('back', panelMaterial))
  world.add(createWallPanel('left', panelMaterial))
  world.add(createWallPanel('right', panelMaterial))
  world.add(createWallPanel('floor', panelMaterial))
  world.add(createWallPanel('ceiling', panelMaterial))
  world.add(createWallGrid('back', wallMaterial))
  world.add(createWallGrid('left', sideMaterial))
  world.add(createWallGrid('right', sideMaterial))
  world.add(createWallGrid('floor', sideMaterial))
  world.add(createWallGrid('ceiling', sideMaterial))
}

function createWallPanel(
  wall: WallKey,
  material: THREE.MeshBasicMaterial,
) {
  const geometry =
    wall === 'left' || wall === 'right'
      ? new THREE.PlaneGeometry(bounds.z * 2, bounds.y * 2)
      : wall === 'floor' || wall === 'ceiling'
        ? new THREE.PlaneGeometry(bounds.x * 2, bounds.z * 2)
        : new THREE.PlaneGeometry(bounds.x * 2, bounds.y * 2)

  const panel = new THREE.Mesh(geometry, material)
  orientWallPlane(panel, wall)
  panel.renderOrder = -2
  return panel
}

function orientWallPlane(mesh: THREE.Object3D, wall: WallKey) {
  if (wall === 'back' || wall === 'front') {
    mesh.position.z = wall === 'back' ? -bounds.z : bounds.z
  }
  if (wall === 'left' || wall === 'right') {
    mesh.position.x = wall === 'left' ? -bounds.x : bounds.x
    mesh.rotation.y = Math.PI / 2
  }
  if (wall === 'floor' || wall === 'ceiling') {
    mesh.position.y = wall === 'floor' ? -bounds.y : bounds.y
    mesh.rotation.x = Math.PI / 2
  }
}

function createWallGrid(
  wall: 'back' | 'left' | 'right' | 'floor' | 'ceiling',
  material: THREE.LineBasicMaterial,
) {
  const step = 1.25
  const points: number[] = []
  const push = (a: THREE.Vector3, b: THREE.Vector3) => {
    points.push(a.x, a.y, a.z, b.x, b.y, b.z)
  }

  if (wall === 'back') {
    const z = -bounds.z
    for (let x = -bounds.x; x <= bounds.x + 0.001; x += step) {
      push(new THREE.Vector3(x, -bounds.y, z), new THREE.Vector3(x, bounds.y, z))
    }
    for (let y = -bounds.y; y <= bounds.y + 0.001; y += step) {
      push(new THREE.Vector3(-bounds.x, y, z), new THREE.Vector3(bounds.x, y, z))
    }
  }

  if (wall === 'left' || wall === 'right') {
    const x = wall === 'left' ? -bounds.x : bounds.x
    for (let z = -bounds.z; z <= bounds.z + 0.001; z += step) {
      push(new THREE.Vector3(x, -bounds.y, z), new THREE.Vector3(x, bounds.y, z))
    }
    for (let y = -bounds.y; y <= bounds.y + 0.001; y += step) {
      push(new THREE.Vector3(x, y, -bounds.z), new THREE.Vector3(x, y, bounds.z))
    }
  }

  if (wall === 'floor' || wall === 'ceiling') {
    const y = wall === 'floor' ? -bounds.y : bounds.y
    for (let x = -bounds.x; x <= bounds.x + 0.001; x += step) {
      push(new THREE.Vector3(x, y, -bounds.z), new THREE.Vector3(x, y, bounds.z))
    }
    for (let z = -bounds.z; z <= bounds.z + 0.001; z += step) {
      push(new THREE.Vector3(-bounds.x, y, z), new THREE.Vector3(bounds.x, y, z))
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  const grid = new THREE.LineSegments(geometry, material)
  grid.renderOrder = -1
  return grid
}

function spawnSphere(position: THREE.Vector3) {
  if (spheres.length >= 64) {
    const removed = spheres.shift()
    removed?.dispose()
  }
  const skill = skills[Math.floor(Math.random() * skills.length)]
  const sphere = new SkillSphere(position, skill)
  spheres.push(sphere)
  return sphere
}

function spawnIdleSphere(position: THREE.Vector3) {
  const sphere = spawnSphere(position)
  sphere.maxBounces = 999
  sphere.velocity.multiplyScalar(0.62)
}

function createBurst(position: THREE.Vector3, color: THREE.ColorRepresentation) {
  for (let i = 0; i < 24; i += 1) {
    sparks.push(new Spark(position, color))
  }
}

function triggerWallFlash(wall: WallKey, point: THREE.Vector3, color: THREE.Color) {
  if (wallFlashes.length >= 10) {
    const expired = wallFlashes.shift()
    if (expired) {
      world.remove(expired.mesh)
      expired.mesh.material.dispose()
    }
  }

  const material = new THREE.MeshBasicMaterial({
    color,
    map: wallFlashTexture,
    transparent: true,
    opacity: 0.74,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  })
  const mesh = new THREE.Mesh(wallFlashGeometry, material)
  const x = THREE.MathUtils.clamp(point.x, -bounds.x + 1.8, bounds.x - 1.8)
  const y = THREE.MathUtils.clamp(point.y, -bounds.y + 1.8, bounds.y - 1.8)
  const z = THREE.MathUtils.clamp(point.z, -bounds.z + 1.8, bounds.z - 1.8)
  mesh.position.set(x, y, z)
  orientWallPlane(mesh, wall)
  if (wall === 'back' || wall === 'front') mesh.position.set(x, y, wall === 'back' ? -bounds.z + 0.04 : bounds.z - 0.04)
  if (wall === 'left' || wall === 'right') mesh.position.set(wall === 'left' ? -bounds.x + 0.04 : bounds.x - 0.04, y, z)
  if (wall === 'floor' || wall === 'ceiling') mesh.position.set(x, wall === 'floor' ? -bounds.y + 0.04 : bounds.y - 0.04, z)
  mesh.renderOrder = 3
  world.add(mesh)
  wallFlashes.push({ mesh, life: 0.72, maxLife: 0.72 })
}

function updateWallFlashes(delta: number) {
  for (let i = wallFlashes.length - 1; i >= 0; i -= 1) {
    const flash = wallFlashes[i]
    flash.life -= delta
    const progress = Math.max(flash.life / flash.maxLife, 0)
    flash.mesh.material.opacity = 0.74 * progress
    flash.mesh.scale.setScalar(0.86 + (1 - progress) * 0.32)
    if (flash.life <= 0) {
      world.remove(flash.mesh)
      flash.mesh.material.dispose()
      wallFlashes.splice(i, 1)
    }
  }
}

function resolveSphereCollisions() {
  for (let i = 0; i < spheres.length; i += 1) {
    const a = spheres[i]
    if (!a.active) continue

    for (let j = i + 1; j < spheres.length; j += 1) {
      const b = spheres[j]
      if (!b.active) continue

      collisionNormal.subVectors(b.group.position, a.group.position)
      const minDistance = a.radius + b.radius
      const distanceSq = collisionNormal.lengthSq()
      if (distanceSq >= minDistance * minDistance) continue

      const distance = Math.sqrt(distanceSq) || 0.0001
      const overlap = minDistance - distance
      collisionNormal.multiplyScalar(1 / distance)

      const aMass = a.radius * a.radius * a.radius
      const bMass = b.radius * b.radius * b.radius
      const totalMass = aMass + bMass
      a.group.position.addScaledVector(collisionNormal, -(overlap * (bMass / totalMass)))
      b.group.position.addScaledVector(collisionNormal, overlap * (aMass / totalMass))

      relativeVelocity.subVectors(b.velocity, a.velocity)
      const separatingSpeed = relativeVelocity.dot(collisionNormal)
      if (separatingSpeed > 0) continue

      const restitution = 0.92
      const impulse = (-(1 + restitution) * separatingSpeed) / (1 / aMass + 1 / bMass)
      a.velocity.addScaledVector(collisionNormal, -impulse / aMass)
      b.velocity.addScaledVector(collisionNormal, impulse / bMass)
      a.velocity.clampLength(2.8, 11)
      b.velocity.clampLength(2.8, 11)
      a.bounce()
      b.bounce()
    }
  }
}

function updatePointer(clientX: number, clientY: number) {
  pointerTarget.x = (clientX / window.innerWidth) * 2 - 1
  pointerTarget.y = -(clientY / window.innerHeight) * 2 + 1
}

function spawnFromScreen(clientX: number, clientY: number) {
  updatePointer(clientX, clientY)
  raycaster.setFromCamera(pointerTarget, camera)
  raycaster.ray.intersectPlane(plane, spawnPoint)
  spawnPoint.x = THREE.MathUtils.clamp(spawnPoint.x, -bounds.x + 2, bounds.x - 2)
  spawnPoint.y = THREE.MathUtils.clamp(spawnPoint.y, -bounds.y + 2, bounds.y - 2)
  spawnPoint.z = THREE.MathUtils.clamp((Math.random() - 0.5) * 7, -bounds.z + 1.8, bounds.z - 1.8)
  spawnSphere(spawnPoint.clone())
}

function onResize() {
  const width = window.innerWidth
  const height = window.innerHeight
  camera.aspect = width / height
  camera.position.z = width < 720 ? 34 : 28
  camera.updateProjectionMatrix()
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 720 ? 1.15 : 1.35))
  renderer.setSize(width, height, false)
}

function animate(now = 0) {
  if (document.hidden) {
    requestAnimationFrame(animate)
    return
  }

  if (now - lastRenderedAt < targetFrameMs) {
    requestAnimationFrame(animate)
    return
  }
  lastRenderedAt = now

  const delta = Math.min(clock.getDelta(), 0.033)
  const elapsed = clock.elapsedTime
  pointer.lerp(pointerTarget, 0.055)
  camera.position.x = pointer.x * 2.2
  camera.position.y = pointer.y * 1.25
  camera.lookAt(0, 0, 0)
  rim.position.x = Math.sin(elapsed * 0.7) * 16
  rim.position.y = 6 + Math.cos(elapsed * 0.45) * 3
  world.rotation.y = Math.sin(elapsed * 0.18) * 0.08 + pointer.x * 0.08
  world.rotation.x = pointer.y * -0.055
  starGroup.rotation.y += delta * 0.018
  updateWallFlashes(delta)

  for (let i = spheres.length - 1; i >= 0; i -= 1) {
    const sphere = spheres[i]
    sphere.update(delta)
  }

  resolveSphereCollisions()

  for (let i = spheres.length - 1; i >= 0; i -= 1) {
    const sphere = spheres[i]
    if (!sphere.active) {
      const material = sphere.mesh.material as THREE.MeshPhysicalMaterial
      createBurst(sphere.group.position.clone(), material.color)
      sphere.dispose()
      spheres.splice(i, 1)
    }
  }

  for (let i = sparks.length - 1; i >= 0; i -= 1) {
    const spark = sparks[i]
    spark.update(delta)
    if (spark.life <= 0) {
      spark.dispose()
      sparks.splice(i, 1)
    }
  }

  if (spheres.length === 0 && sparks.length === 0 && elapsed - lastIdleSpawn > 1.8) {
    lastIdleSpawn = elapsed
    spawnIdleSphere(
      new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(6),
        THREE.MathUtils.randFloat(2.4, 5.4),
        THREE.MathUtils.randFloatSpread(2),
      ),
    )
  }

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

function handleHash() {
  const panel = window.location.hash.replace('#', '')
  if (panel === 'home') {
    closePanel()
    return
  }
  document.body.dataset.panel = panel || 'home'
}

function closePanel() {
  const cleanUrl = `${window.location.pathname}${window.location.search}`
  window.history.replaceState(null, '', cleanUrl)
  document.body.dataset.panel = 'home'
}

buildStars()
buildFrame()
onResize()
handleHash()
spawnIdleSphere(new THREE.Vector3(-3.4, 4.4, 0))
spawnIdleSphere(new THREE.Vector3(3.4, 4.1, 1))

window.addEventListener('resize', onResize)
window.addEventListener('hashchange', handleHash)
document.querySelectorAll<HTMLAnchorElement>('[data-close-panel]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault()
    closePanel()
  })
})
window.addEventListener('pointermove', (event) => updatePointer(event.clientX, event.clientY))
window.addEventListener('pointerdown', (event) => {
  const target = event.target as HTMLElement
  if (target.closest('a, button, .panel')) return
  spawnFromScreen(event.clientX, event.clientY)
})
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault()
    spawnSphere(new THREE.Vector3(0, 0, 0))
  }
  if (event.code === 'Escape') {
    closePanel()
  }
})

animate()
