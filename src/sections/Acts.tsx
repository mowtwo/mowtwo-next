import Act from './Act'
import Console from '../components/Console'
import Archive from './Archive'
import { DialRing, Hud, type HudNode } from './Hud'
import { about, acts, experience, profile, skills, stats, type Project } from '../data/content'
import { useLocale } from '../i18n/context'

const YEAR = new Date().getFullYear()

/* I — forge: who. A giant outlined M2 stands behind the robot. */
export function ActForge() {
  const { t } = useLocale()
  return (
    <Act index={0} length={150} side="hud">
      <div className="forge-type" aria-hidden>
        M2
      </div>
      <div className="forge-top">
        <p className="act-heading">{t(acts[0].heading)}</p>
      </div>
      <div className="forge-id">
        <h1 className="hero-name">{profile.handle}</h1>
        <p className="hero-sub">
          {t(profile.name)} · {t(profile.role)}
        </p>
        <p className="act-body">{t(profile.tagline)}</p>
        <p className="act-now">◦ {t(profile.nowLine)}</p>
      </div>
      <div className="forge-console">
        <Console />
      </div>
    </Act>
  )
}

/* II — clockwork: about, read off a watch face around the robot */
export function ActClockwork() {
  const { t } = useLocale()
  const nodes: HudNode[] = [
    { side: 'left', y: 34, children: <p className="act-body">{t(about[0])}</p> },
    { side: 'right', y: 34, mobileHide: true, children: <p className="act-body">{t(about[1])}</p> },
    ...stats.map((st, i) => ({
      side: (i % 2 ? 'right' : 'left') as 'left' | 'right',
      y: i < 2 ? 64 : 77,
      children: (
        <div className="stat">
          <div className="stat-value">{st.value}</div>
          <div className="stat-label">{t(st.label)}</div>
        </div>
      ),
    })),
  ]
  return (
    <Act index={1} length={140} side="hud">
      <h2 className="act-title hud-title">{t(acts[1].heading)}</h2>
      <Hud nodes={nodes} wire="straight">
        <DialRing />
      </Hud>
    </Act>
  )
}

/* III — circuit: each skill group is wired to the robot by a live trace */
export function ActCircuit() {
  const { t } = useLocale()
  const nodes: HudNode[] = skills.map((g, i) => ({
    side: i % 2 ? 'right' : 'left',
    y: i < 2 ? 36 : 70,
    children: (
      <div className="skill-group">
        <div className="skill-head">{t(g.group)}</div>
        <div className="skill-items">
          {g.items.map((it) => (
            <span key={it} className="chip">
              {it}
            </span>
          ))}
        </div>
      </div>
    ),
  }))
  return (
    <Act index={2} length={140} side="hud">
      <h2 className="act-title hud-title">{t(acts[2].heading)}</h2>
      <Hud nodes={nodes} wire="pcb" />
    </Act>
  )
}

/* IV — neural: the career as a constellation; the current role glows */
export function ActNeural() {
  const { t } = useLocale()
  const nodes: HudNode[] = experience.map((e, idx) => ({
    side: idx % 2 ? 'right' : 'left',
    y: idx < 2 ? 36 : 72,
    glow: idx === 0,
    children: (
      <div className="tl-node">
        <div className="tl-period">{e.period}</div>
        <div className="tl-company">{e.company}</div>
        <div className="tl-role">{t(e.role)}</div>
        {(idx === 0 ? e.points : e.points.slice(0, 1)).map((p, i) => (
          <p key={i} className="tl-point">
            {t(p)}
          </p>
        ))}
      </div>
    ),
  }))
  return (
    <Act index={3} length={150} side="hud">
      <h2 className="act-title hud-title">{t(acts[3].heading)}</h2>
      <Hud nodes={nodes} wire="curve" />
    </Act>
  )
}

/* V — orbit: the archive */
export function ActOrbit({ onOpen }: { onOpen: (p: Project) => void }) {
  const { t } = useLocale()
  return (
    <Act index={4} length={240} side="center">
      <h2 className="act-title act-title-center">{t(acts[4].heading)}</h2>
      <Archive onOpen={onOpen} />
    </Act>
  )
}

/* VI — signal: contact */
export function ActSignal() {
  const { t } = useLocale()
  const links = [
    { label: 'Email', value: profile.links.email, href: `mailto:${profile.links.email}` },
    { label: 'GitHub', value: 'github.com/mowtwo', href: profile.links.github },
    { label: 'Site', value: 'mowtwo.com', href: profile.links.site },
  ]
  return (
    <Act index={5} length={130} side="center">
      <h2 className="act-title act-title-center signal-title">{t(acts[5].heading)}</h2>
      <div className="contact">
        {links.map((l) => (
          <a key={l.label} className="contact-link" href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
            <span className="contact-label">{l.label}</span>
            <span className="contact-value">{l.value}</span>
          </a>
        ))}
      </div>
      <a className="playbook-link" href={profile.links.playbook} target="_blank" rel="noreferrer">
        <span className="playbook-tag">{t({ en: 'Making of', zh: '幕后' })}</span>
        {t(profile.playbookLabel)} -&gt;
      </a>
      <p className="act-foot">
        {t(profile.location)} · © {YEAR} {profile.handle}
      </p>
    </Act>
  )
}
