// All site copy, in both languages. Sources: mowtwo.com, github.com/mowtwo (repo
// descriptions / READMEs) and the user's own career history.
import type { L } from '../i18n/types.ts'

export const profile = {
  handle: 'M2',
  name: { en: 'Chen Wencheng', zh: '陈文程' } as L,
  role: { en: 'AI Full-stack Engineer', zh: 'AI 全栈工程师' } as L,
  tagline: {
    en: 'React / FastAPI / RAG / Agent infrastructure, built with startup-speed ownership.',
    zh: 'React / FastAPI / RAG / Agent 基础设施——用创业公司的速度，对结果负责到底。',
  } as L,
  nowLine: {
    en: 'Senior Developer @ RankAI (rankai.ai) — leading SEO / AEO engineering.',
    zh: '现任 RankAI（rankai.ai）高级开发，负责 SEO / AEO 工程。',
  } as L,
  location: { en: 'Fuzhou, China · Remote', zh: '中国福州 · 远程' } as L,
  links: {
    github: 'https://github.com/mowtwo',
    site: 'https://mowtwo.com',
    email: 'mowtwo@foxmail.com',
    /** how this site was built: workflow, MCP tooling, skills and the full prompt set */
    playbook: 'https://github.com/mowtwo/m2-site-playbook',
  },
  playbookLabel: { en: 'How this site was built — the agent playbook', zh: '这个网站是怎么做出来的 · Agent 全流程手册' } as L,
}

/* ------------------------------------------------------------------ acts -- */

export type ActKey = 'forge' | 'clockwork' | 'circuit' | 'neural' | 'orbit' | 'signal'

export const acts: { key: ActKey; roman: string; name: L; era: L; heading: L }[] = [
  {
    key: 'forge',
    roman: 'I',
    name: { en: 'Forge', zh: '锻造' },
    era: { en: 'Iron age', zh: '铁器时代' },
    heading: { en: 'Every machine starts as raw iron.', zh: '每一台机器，都从一块生铁开始。' },
  },
  {
    key: 'clockwork',
    roman: 'II',
    name: { en: 'Clockwork', zh: '钟表' },
    era: { en: 'Age of gears', zh: '齿轮时代' },
    heading: { en: 'Precision, one gear at a time.', zh: '精密，从一枚齿轮开始。' },
  },
  {
    key: 'circuit',
    roman: 'III',
    name: { en: 'Circuit', zh: '电路' },
    era: { en: 'Electric age', zh: '电气时代' },
    heading: { en: 'The stack that carries the current.', zh: '承载电流的技术栈。' },
  },
  {
    key: 'neural',
    roman: 'IV',
    name: { en: 'Neural', zh: '神经' },
    era: { en: 'Learning machines', zh: '会学习的机器' },
    heading: { en: 'Everything it learned along the way.', zh: '它一路上学到的一切。' },
  },
  {
    key: 'orbit',
    roman: 'V',
    name: { en: 'Archive', zh: '档案' },
    era: { en: 'In orbit', zh: '轨道运行' },
    heading: { en: 'Things I have built, in orbit.', zh: '我造过的东西，都在轨道上运转。' },
  },
  {
    key: 'signal',
    roman: 'VI',
    name: { en: 'Signal', zh: '信号' },
    era: { en: 'Transmission', zh: '发射' },
    heading: { en: 'Open a channel.', zh: '建立连接。' },
  },
]

/* ----------------------------------------------------------------- about -- */

export const about: L[] = [
  {
    en: 'Front-end-leaning AI full-stack engineer, 5+ years in. I build product frontends, Python/FastAPI backends, RAG & agent systems, async pipelines and the AWS/Terraform infra under them.',
    zh: '偏前端的 AI 全栈工程师，五年以上经验。做产品前端、Python/FastAPI 后端、RAG 与 Agent 系统、异步流水线，以及它们底下的 AWS/Terraform 基础设施。',
  },
  {
    en: 'Now Senior Developer at RankAI, leading SEO / AEO (answer-engine optimization) engineering — Next.js SSR, structured data, and the systems that make content rank and get cited by AI.',
    zh: '现任 RankAI 高级开发，负责 SEO / AEO（答案引擎优化）工程——Next.js SSR、结构化数据，以及让内容被搜索引擎排上来、被 AI 引用的那套系统。',
  },
]

export const stats: { value: string; label: L }[] = [
  { value: '5+', label: { en: 'years shipping', zh: '年交付经验' } },
  { value: '60+', label: { en: 'public repos', zh: '个公开仓库' } },
  { value: '2000+', label: { en: 'SSG pages, one site', zh: '页静态站点' } },
  { value: '98', label: { en: 'Lighthouse score', zh: 'Lighthouse 分' } },
]

/* ---------------------------------------------------------------- skills -- */

export const skills: { group: L; items: string[] }[] = [
  {
    group: { en: 'Frontend', zh: '前端' },
    items: ['React', 'Next.js 14 App Router', 'TypeScript', 'Tailwind', 'Canvas / WebGL', 'Electron', 'Uniapp / Taro'],
  },
  {
    group: { en: 'Backend', zh: '后端' },
    items: ['Python / FastAPI', 'asyncio', 'PostgreSQL · SQLAlchemy 2', 'pgvector', 'Redis', 'SQS async workers'],
  },
  {
    group: { en: 'AI', zh: 'AI' },
    items: ['RAG / vector search', 'Agent runtime', 'Multi-model orchestration', 'Metering gateway', 'Memory / context'],
  },
  {
    group: { en: 'Infra / SEO', zh: '基础设施 / SEO' },
    items: ['AWS (S3 / SQS / ECS)', 'Terraform', 'Cloudflare', 'GitHub Actions', 'SSG · structured data', 'Core Web Vitals'],
  },
]

/* ------------------------------------------------------------ experience -- */

export const experience: { period: string; company: string; role: L; points: L[] }[] = [
  {
    period: '2025 — Now',
    company: 'RankAI · rankai.ai',
    role: { en: 'Senior Developer — SEO / AEO', zh: '高级开发 — SEO / AEO' },
    points: [
      {
        en: 'Leading SEO / AEO platform engineering: Next.js SSR rebuild, structured data, answer-engine optimization.',
        zh: '负责 SEO / AEO 平台工程：Next.js SSR 重构、结构化数据、答案引擎优化。',
      },
      { en: 'End-to-end ownership — frontend to backend to release.', zh: '从前端、后端到发布，端到端负责。' },
    ],
  },
  {
    period: '2025',
    company: 'Tiantian Intelligence',
    role: { en: 'Core Full-stack Engineer', zh: '核心全栈工程师' },
    points: [
      {
        en: 'Core developer on an AI imaging platform for cross-border commerce (customers incl. SHEIN, Unifi3D).',
        zh: '跨境电商 AI 图像平台核心开发（客户包括 SHEIN、Unifi3D）。',
      },
      {
        en: 'FastAPI + SQS/ECS async pipelines, multi-model orchestration, Stripe metering, Terraform infra.',
        zh: 'FastAPI + SQS/ECS 异步生成流水线、多模型编排、Stripe 计量、Terraform 基础设施。',
      },
    ],
  },
  {
    period: '2023 — 2025',
    company: 'uTools · Fuzhou Yuanli',
    role: { en: 'Senior Frontend Engineer', zh: '高级前端工程师' },
    points: [
      {
        en: 'Next.js 14 App Router products, a self-built Canvas image editor, Electron tooling.',
        zh: 'Next.js 14 App Router 产品、自研 Canvas 图片编辑器、Electron 工具链。',
      },
      {
        en: 'uTools marketing site: SSG 2000+ pages, 90%+ SEO coverage, Lighthouse 98.',
        zh: 'uTools 官网：静态生成 2000+ 页面，SEO 覆盖 90%+，Lighthouse 98 分。',
      },
    ],
  },
  {
    period: '2021 — 2023',
    company: '4399',
    role: { en: 'Frontend Engineer', zh: '前端工程师' },
    points: [{ en: 'Product frontend across web and mini-programs.', zh: 'Web 与小程序产品前端。' }],
  },
]

/* -------------------------------------------------------------- projects -- */

export type CategoryKey = 'products' | 'ai' | 'lang' | 'lab' | 'tools'

export const categories: { key: CategoryKey; label: L }[] = [
  { key: 'products', label: { en: 'Products', zh: '产品' } },
  { key: 'ai', label: { en: 'AI / Agents', zh: 'AI / Agent' } },
  { key: 'lang', label: { en: 'Languages & frameworks', zh: '语言与框架' } },
  { key: 'lab', label: { en: 'Creative lab', zh: '创意实验室' } },
  { key: 'tools', label: { en: 'Dev tools', zh: '开发工具' } },
]

export type Project = {
  id: string
  name: string
  year: string
  category: CategoryKey
  stack: string
  blurb: L
  /** screenshot in /public/shots, or omitted → generated cover */
  image?: string
  links: { label: L; href: string }[]
}

const gh = (repo: string) => ({ label: { en: 'GitHub', zh: 'GitHub' }, href: `https://github.com/mowtwo/${repo}` })
const live = (href: string) => ({ label: { en: 'Live', zh: '在线体验' }, href })

export const projects: Project[] = [
  // ---- products
  {
    id: 'whatevertools',
    name: 'whatevertools',
    year: '2026',
    category: 'products',
    stack: 'TypeScript · Electron · Plugin system',
    blurb: {
      en: 'A plugin system for productivity software — one plugin codebase runs in Electron apps, on the web and on your own platform. Dynamic install, permissions, hooks, signed packaging, MCP tools.',
      zh: '效率软件的插件系统：同一套插件跑在 Electron 应用、网页和你自己的平台上。动态安装、权限、hook、签名打包、MCP 工具一应俱全。',
    },
    image: '/shots/whatevertools.png',
    links: [live('https://whatevertools.mowtwo.com'), gh('whatevertools')],
  },
  {
    id: 'quick-union-image',
    name: 'quick-union-image',
    year: '2026',
    category: 'products',
    stack: 'TypeScript · uTools · shadcn/ui',
    blurb: {
      en: 'An image-stitching plugin — equal-height, grid and long-image merges, with built-in editing, batch workflows and AI orchestration.',
      zh: '快拼图：uTools 图片拼接插件，等高拼接、宫格、长图，附带图片编辑、批量工作流与 AI 编排。',
    },
    image: '/shots/quick-union-image.png',
    links: [live('https://whatevertools.mowtwo.com/cases/quick-union-image'), gh('utools-quick-union-image')],
  },
  {
    id: 'desktop-widgets',
    name: 'desktop-widgets',
    year: '2026',
    category: 'products',
    stack: 'TypeScript · uTools / Electron',
    blurb: {
      en: 'A desktop "clothesline" pinned to the top of your screen — notes, todos, files, screenshots and extensible widgets all hang on it.',
      zh: '桌面晾衣绳：挂在屏幕顶部的一根绳子，便签、待办、文件、截图和可扩展的挂件都挂在上面。',
    },
    image: '/shots/desktop-widgets.png',
    links: [live('https://whatevertools.mowtwo.com/cases/desktop-widgets'), gh('utools-desktop-widgets')],
  },
  {
    id: 'metering-do',
    name: 'Metering Do',
    year: '2026',
    category: 'products',
    stack: 'TypeScript · PWA',
    blurb: {
      en: 'A PWA that tracks what your belongings really cost — purchase, one-off and recurring expenses, resale — and works out daily and net cost per asset.',
      zh: '个人资产费用追踪 PWA：记录购买价、一次性与周期性支出、出售收入，自动算出每件资产的日均成本与净成本。',
    },
    image: '/shots/metering.png',
    links: [live('https://metering.mowtwo.com'), gh('metering-do')],
  },
  {
    id: 'utools-file-browser',
    name: 'utools-file-browser',
    year: '2024',
    category: 'products',
    stack: 'JavaScript · Node fs · uTools',
    blurb: {
      en: 'A file browser inside uTools with extra commands on top of the usual navigation.',
      zh: '基于 uTools 的文件浏览器，在常规浏览之外支持一些额外指令。',
    },
    links: [gh('utools-file-browser')],
  },
  // ---- AI
  {
    id: 'enterprise-context',
    name: 'Enterprise Context',
    year: '2026',
    category: 'ai',
    stack: 'React · FastAPI · pgvector',
    blurb: {
      en: 'A local-first enterprise RAG demo: ingest documents, ask cited questions, inspect retrieval debug details and audit logs. Runs zero-key by default.',
      zh: '本地优先的企业级 RAG 演示：导入文档、带引用的问答、检索调试详情与审计日志。默认无需任何 API Key 即可运行。',
    },
    links: [gh('enterprise-context-web'), gh('enterprise-context-api')],
  },
  {
    id: 'gpt-embedding-tuning-client',
    name: 'embedding-tuning-client',
    year: '2023',
    category: 'ai',
    stack: 'Electron · Vue · OpenAI',
    blurb: {
      en: 'A desktop tool for debugging OpenAI embeddings — compare inputs and tune retrieval by hand.',
      zh: '基于 OpenAI 的 embedding 调试桌面工具，对比输入、手动调优检索效果。',
    },
    links: [gh('gpt-embedding-tuning-client')],
  },
  // ---- languages & frameworks
  {
    id: 'tu',
    name: 'tu (图)',
    year: '2026',
    category: 'lang',
    stack: 'TypeScript · Compiler · LSP',
    blurb: {
      en: 'A reactive UI language — trailing-closure DSL, scoped styles, TC39 Signals, full LSP. Compiles to a TypeScript shadow for end-to-end types.',
      zh: '一门响应式 UI 语言：尾随闭包 DSL、作用域样式、TC39 Signals、完整 LSP，编译成 TypeScript 影子文件实现端到端类型。',
    },
    image: '/shots/tu.png',
    links: [live('https://mowtwo.github.io/tu/'), gh('tu')],
  },
  {
    id: 'x-states-vdom',
    name: 'x-states-vdom',
    year: '2022',
    category: 'lang',
    stack: 'JavaScript · VDOM · Reactivity',
    blurb: {
      en: 'A tiny toy framework built on a virtual DOM and reactive state.',
      zh: '一个很小的、基于虚拟 DOM 和响应式的框架玩具。',
    },
    links: [live('https://mowtwo.github.io/x-states-vdom/'), gh('x-states-vdom')],
  },
  {
    id: 'mvc-reactive',
    name: 'mvc-reactive',
    year: '2022',
    category: 'lang',
    stack: 'JavaScript · Recursive descent',
    blurb: {
      en: 'What if a Stimulus-style MVC had Vue-style reactive data? ~200 lines, with a small recursive-descent parser.',
      zh: '如果 Stimulus 那样的 MVC 也有 Vue 式的响应式数据会怎样？约 200 行核心代码，带一个递归下降解析器。',
    },
    links: [live('https://mowtwo.github.io/mvc-reactive/'), gh('mvc-reactive')],
  },
  {
    id: 'wicg-observable',
    name: 'wicg-observable',
    year: '2025',
    category: 'lang',
    stack: 'TypeScript · npm',
    blurb: {
      en: 'A small implementation of the WICG Observable interface, published to npm.',
      zh: 'WICG Observable 接口的一个简单实现，已发布到 npm。',
    },
    links: [gh('wicg-observable')],
  },
  // ---- creative lab
  {
    id: 'giggle-lab',
    name: 'giggle-lab',
    year: '2026',
    category: 'lab',
    stack: 'TypeScript · WebGL / Canvas',
    blurb: {
      en: 'A playground of browser toys — Three.js visuals, AR hand gestures, media processing. 13+ live apps.',
      zh: '浏览器小玩具合集：Three.js 视觉、AR 手势、媒体处理等，13 个以上在线应用。',
    },
    image: '/shots/giggle-lab.png',
    links: [live('https://giggle-lab.vercel.app'), gh('giggle-lab')],
  },
  {
    id: 'string-string',
    name: 'string-string',
    year: '2026',
    category: 'lab',
    stack: 'TypeScript · Verlet physics',
    blurb: {
      en: 'A text rope physics toy — type words and pull the thread.',
      zh: '文字绳子物理玩具：打几个字，然后拽着这根线玩。',
    },
    image: '/shots/string-string.png',
    links: [live('https://mowtwo.github.io/string-string/'), gh('string-string')],
  },
  {
    id: 'css-draw',
    name: 'css-draw',
    year: '2022',
    category: 'lab',
    stack: 'Canvas · box-shadow',
    blurb: {
      en: 'Draw any picture with pure CSS: read the pixels through canvas and paint each one as a box-shadow.',
      zh: '用纯 CSS 画图：通过 canvas 读出像素，再把每个像素画成一个 box-shadow。',
    },
    links: [live('https://css-draw.mowtwo.com/'), gh('css-draw')],
  },
  {
    id: 'im-style-blog',
    name: 'im-style-blog',
    year: '2024',
    category: 'lab',
    stack: 'TypeScript',
    blurb: {
      en: 'A blog that looks suspiciously like a chat app.',
      zh: '一个长得很像聊天软件的博客（可能不是）。',
    },
    links: [gh('im-style-blog')],
  },
  {
    id: 'ios-file-system',
    name: 'ios-file-system',
    year: '2022',
    category: 'lab',
    stack: 'React · Jotai · File System Access',
    blurb: {
      en: 'An iOS-style file browser toy built on the native File System Access API.',
      zh: '基于原生 File System Access API 的 iOS 风格文件浏览玩具。',
    },
    links: [live('https://nfs.mowtwo.com'), gh('ios-file-system')],
  },
  // ---- dev tools
  {
    id: 'vite-plugin-utools-plugin',
    name: 'vite-plugin-utools-plugin',
    year: '2025',
    category: 'tools',
    stack: 'TypeScript · Vite plugin',
    blurb: {
      en: 'A Vite plugin for building uTools plugins: separates the Node preload, and standardises plugin.json and asset layout.',
      zh: '用 Vite 开发 uTools 插件的辅助插件：分离 Node preload 部分，规范 plugin.json 与资源位置。',
    },
    links: [gh('vite-plugin-utools-plugin')],
  },
  {
    id: 'video-record',
    name: 'video-record',
    year: '2022',
    category: 'tools',
    stack: 'Vue · MediaRecorder · ffmpeg.wasm',
    blurb: {
      en: 'Screen capture and recording in the browser with getDisplayMedia and MediaRecorder.',
      zh: '用 getDisplayMedia 和 MediaRecorder 在浏览器里进行屏幕捕获与录制。',
    },
    links: [live('https://video-record.mowtwo.com/'), gh('video-record')],
  },
]

/* ------------------------------------------------------- console topics -- */

export type Topic = { key: string; label: L; keywords: string[]; answer: L }

export const topics: Topic[] = [
  {
    key: 'seo-aeo',
    label: { en: 'SEO / AEO', zh: 'SEO / AEO' },
    keywords: ['seo', 'aeo', 'rank', 'answer', 'serp', 'rankai', 'now', 'current', '现在', '搜索'],
    answer: profile.nowLine,
  },
  {
    key: 'ai-backend',
    label: { en: 'AI backend', zh: 'AI 后端' },
    keywords: ['ai', 'backend', 'model', 'llm', 'rag', 'agent', '后端', '模型'],
    answer: {
      en: 'AI full-stack: RAG & vector search, agent runtime, multi-model orchestration, SQS/ECS async pipelines, metering.',
      zh: 'AI 全栈：RAG 与向量检索、Agent 运行时、多模型编排、SQS/ECS 异步流水线、计量。',
    },
  },
  {
    key: 'frontend',
    label: { en: 'Frontend', zh: '前端' },
    keywords: ['frontend', 'react', 'next', 'ui', 'webgl', 'canvas', 'three', 'typescript', 'electron', '前端'],
    answer: {
      en: 'Frontend: React / Next.js / TypeScript, self-built Canvas editors, Electron, plus WebGL toys like this site.',
      zh: '前端：React / Next.js / TypeScript、自研 Canvas 编辑器、Electron，还有像这个网站一样的 WebGL 小玩意儿。',
    },
  },
  {
    key: 'infra',
    label: { en: 'Infra', zh: '基础设施' },
    keywords: ['infra', 'aws', 'terraform', 'ci', 'deploy', 'cloudflare', '部署'],
    answer: {
      en: 'Infra: AWS (S3 / SQS / ECS Fargate), Terraform, Cloudflare, GitHub Actions.',
      zh: '基础设施：AWS（S3 / SQS / ECS Fargate）、Terraform、Cloudflare、GitHub Actions。',
    },
  },
  {
    key: 'projects',
    label: { en: 'Projects', zh: '作品' },
    keywords: ['project', 'work', 'repo', 'github', 'tu', 'giggle', 'whatevertools', '项目', '作品'],
    answer: {
      en: 'Scroll to Act V — the archive keeps everything in orbit.',
      zh: '滚到第五幕——所有作品都在那个轨道档案里。',
    },
  },
]
