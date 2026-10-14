# M2 · LEVEL 2

Personal site of Chen Wencheng (陈文程, M2) — [mowtwo.com](https://mowtwo.com).

An interactive WebGL story in six acts: a robot evolves from medieval iron to future light
(Forge → Clockwork → Circuit → Neural → Archive → Signal). Bilingual (English / 简体中文).

- React 19 + Vite + TypeScript, three.js via @react-three/fiber / drei / postprocessing
- Hero mask and props modelled in Blender (`blender/`), exported as Draco GLB (`public/models/`)
- Procedural, generative soundtrack (Web Audio, no audio files)
- SEO / GEO generated at build time from `src/data/content.ts`: TDK, Open Graph, JSON-LD,
  `<noscript>` text, `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # → dist/
```

`VITE_SITE_URL` sets the canonical origin for the generated SEO files (default `https://mowtwo.com`).

All copy and the project list live in `src/data/content.ts`.

## How it was built

The whole site was built by an AI agent. The distilled recipe — workflow, MCP tooling, reusable skills and the full
prompt set — is public: **[mowtwo/m2-site-playbook](https://github.com/mowtwo/m2-site-playbook)**.
