import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { about, acts, categories, experience, profile, projects, skills } from './src/data/content.ts'

/**
 * SEO + GEO from one source of truth (src/data/content.ts):
 *   - <head>: TDK, canonical, Open Graph / Twitter, JSON-LD (ProfilePage + Person + ItemList)
 *   - <noscript>: the whole site as plain bilingual HTML for crawlers that don't run JS
 *   - robots.txt, sitemap.xml
 *   - llms.txt (summary) + llms-full.txt (everything) for answer engines
 */
function seo(site: string): Plugin {
  const url = site.replace(/\/$/, '')
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const catLabel = (k: string) => categories.find((c) => c.key === k)!.label

  const title = `M2 · ${profile.name.zh} ${profile.name.en} — ${profile.role.en} | RAG · Agent · SEO / AEO`
  // kept under ~160 characters so search results show it whole
  const description = `${profile.name.en} (${profile.name.zh}, M2) — ${profile.role.en}: React, FastAPI, RAG and agent systems. Senior Developer at RankAI, leading SEO / AEO.`
  const keywords = [
    profile.name.en,
    profile.name.zh,
    'M2',
    'mowtwo',
    'AI Full-stack Engineer',
    'AI 全栈工程师',
    'RAG',
    'AI Agent',
    'FastAPI',
    'React',
    'Next.js',
    'SEO',
    'AEO',
    'WebGL',
    'Three.js',
    'portfolio',
  ].join(', ')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${url}/#page`,
        url: `${url}/`,
        name: title,
        description,
        inLanguage: ['en', 'zh-CN'],
        mainEntity: { '@id': `${url}/#person` },
      },
      {
        '@type': 'Person',
        '@id': `${url}/#person`,
        name: profile.name.en,
        alternateName: [profile.name.zh, 'M2', 'mowtwo'],
        jobTitle: profile.role.en,
        description: about.map((a) => a.en).join(' '),
        url: `${url}/`,
        image: `${url}/brand/m2-avatar-1024.png`,
        email: `mailto:${profile.links.email}`,
        homeLocation: { '@type': 'Place', name: 'Fuzhou, China' },
        worksFor: { '@type': 'Organization', name: 'RankAI', url: 'https://rankai.ai' },
        knowsAbout: skills.flatMap((g) => g.items),
        sameAs: [profile.links.github, profile.links.site],
      },
      {
        '@type': 'ItemList',
        '@id': `${url}/#projects`,
        name: 'Selected projects',
        itemListElement: projects.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'SoftwareSourceCode',
            name: p.name,
            description: p.blurb.en,
            programmingLanguage: p.stack,
            dateCreated: p.year,
            author: { '@id': `${url}/#person` },
            url: p.links[0]?.href,
            codeRepository: p.links.find((l) => l.href.includes('github.com'))?.href,
          },
        })),
      },
    ],
  }

  const head = `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta name="keywords" content="${esc(keywords)}" />
    <meta name="author" content="${esc(profile.name.en)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${url}/" />
    <meta property="og:type" content="profile" />
    <meta property="og:site_name" content="M2" />
    <meta property="og:url" content="${url}/" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${url}/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:locale:alternate" content="zh_CN" />
    <meta property="profile:first_name" content="Wencheng" />
    <meta property="profile:last_name" content="Chen" />
    <meta property="profile:username" content="mowtwo" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${url}/og.png" />
    <link rel="alternate" type="text/plain" title="llms.txt" href="${url}/llms.txt" />
    <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`

  const both = (s: { en: string; zh: string }) => `${esc(s.en)} <span lang="zh-CN">${esc(s.zh)}</span>`
  const noscript = `
    <noscript>
      <main class="seo-static">
        <h1>${esc(profile.handle)} — ${both(profile.name)} · ${both(profile.role)}</h1>
        <p>${both(profile.tagline)}</p>
        <p>${both(profile.nowLine)}</p>
        <section><h2>About · 关于</h2>${about.map((a) => `<p>${both(a)}</p>`).join('')}</section>
        <section><h2>Experience · 经历</h2><ol>${experience
          .map((e) => `<li><h3>${esc(e.company)} — ${both(e.role)} (${esc(e.period)})</h3>${e.points.map((p) => `<p>${both(p)}</p>`).join('')}</li>`)
          .join('')}</ol></section>
        <section><h2>Skills · 技能</h2><ul>${skills.map((g) => `<li><strong>${both(g.group)}</strong>: ${esc(g.items.join(', '))}</li>`).join('')}</ul></section>
        <section><h2>Projects · 作品</h2><ul>${projects
          .map(
            (p) =>
              `<li><h3>${esc(p.name)} (${esc(p.year)}, ${both(catLabel(p.category))})</h3><p>${both(p.blurb)}</p><p>${esc(p.stack)}</p><p>${p.links
                .map((l) => `<a href="${esc(l.href)}">${esc(l.label.en)}</a>`)
                .join(' · ')}</p></li>`,
          )
          .join('')}</ul></section>
        <section><h2>Contact · 联系</h2><p><a href="mailto:${esc(profile.links.email)}">${esc(profile.links.email)}</a> · <a href="${esc(profile.links.github)}">GitHub</a> · <a href="${esc(profile.links.site)}">mowtwo.com</a></p></section>
      </main>
    </noscript>`

  const llms = [
    `# M2 — ${profile.name.en} (${profile.name.zh})`,
    '',
    `> ${profile.role.en} · ${profile.tagline.en} ${profile.nowLine.en}`,
    '',
    `Personal site of ${profile.name.en}, also known as M2 or mowtwo (${profile.location.en}). It is an interactive WebGL story in six acts (${acts
      .map((a) => a.name.en)
      .join(', ')}) — a robot evolving from medieval iron to future light. Content is bilingual (English / 简体中文).`,
    '',
    '## Key facts',
    `- Current role: ${profile.nowLine.en}`,
    `- Focus: ${skills.map((g) => `${g.group.en} (${g.items.slice(0, 3).join(', ')})`).join('; ')}`,
    `- Contact: ${profile.links.email}`,
    `- GitHub: ${profile.links.github}`,
    '',
    '## Projects',
    ...projects.map((p) => `- [${p.name}](${p.links[0]?.href ?? profile.links.github}): ${p.blurb.en}`),
    '',
    '## More',
    `- [Full text for LLMs](${url}/llms-full.txt): about, experience, skills and every project in both languages`,
    '',
  ].join('\n')

  const llmsFull = [
    `# ${profile.name.en} (${profile.name.zh}) — M2 / mowtwo`,
    '',
    `${profile.role.en} / ${profile.role.zh}. ${profile.location.en}.`,
    '',
    '## About',
    ...about.flatMap((a) => [a.en, '', a.zh, '']),
    '## Experience',
    ...experience.flatMap((e) => [`### ${e.company} — ${e.role.en} / ${e.role.zh} (${e.period})`, ...e.points.flatMap((p) => [`- ${p.en}`, `- ${p.zh}`]), '']),
    '## Skills',
    ...skills.map((g) => `- ${g.group.en} / ${g.group.zh}: ${g.items.join(', ')}`),
    '',
    '## Projects',
    ...projects.flatMap((p) => [
      `### ${p.name} (${p.year}) — ${catLabel(p.category).en} / ${catLabel(p.category).zh}`,
      `Stack: ${p.stack}`,
      '',
      p.blurb.en,
      '',
      p.blurb.zh,
      '',
      ...p.links.map((l) => `- ${l.label.en}: ${l.href}`),
      '',
    ]),
    '## Contact',
    `- Email: ${profile.links.email}`,
    `- GitHub: ${profile.links.github}`,
    `- Site: ${url}/`,
    '',
  ].join('\n')

  const today = new Date().toISOString().slice(0, 10)
  const files: Record<string, string> = {
    'llms.txt': llms,
    'llms-full.txt': llmsFull,
    'robots.txt': [
      'User-agent: *',
      'Allow: /',
      '',
      '# answer engines are welcome',
      ...['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'].flatMap((b) => [
        `User-agent: ${b}`,
        'Allow: /',
        '',
      ]),
      `Sitemap: ${url}/sitemap.xml`,
      '',
    ].join('\n'),
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${url}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${url}/llms.txt</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.3</priority></url>
</urlset>
`,
  }

  return {
    name: 'm2-seo',
    transformIndexHtml(html) {
      return html.replace('<!--seo:head-->', head).replace('<!--seo:noscript-->', noscript)
    },
    // dev: serve the generated text files
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = req.url?.split('?')[0].replace(/^\//, '') ?? ''
        if (!(name in files)) return next()
        res.setHeader('Content-Type', name.endsWith('.xml') ? 'application/xml; charset=utf-8' : 'text/plain; charset=utf-8')
        res.end(files[name])
      })
    },
    // build: emit them next to index.html
    generateBundle() {
      for (const [fileName, source] of Object.entries(files)) this.emitFile({ type: 'asset', fileName, source })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), seo(env.VITE_SITE_URL || 'https://mowtwo.com')],
  }
})
