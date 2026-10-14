import { useEffect } from 'react'
import { categories, type Project } from '../data/content'
import { useLocale } from '../i18n/context'

type Props = {
  project: Project | null
  onClose: () => void
}

export default function ProjectDetail({ project, onClose }: Props) {
  const { t } = useLocale()
  useEffect(() => {
    if (!project) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [project, onClose])

  if (!project) return null

  return (
    <div
      className="scroll underwater-veil"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0,3,8,0.6)',
        backdropFilter: 'blur(18px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.3)',
        overflowY: 'auto',
        animation: 'fadeIn 0.45s ease both',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 'clamp(16px, 2.4vw, 28px)',
          right: 'clamp(18px, 3vw, 44px)',
          fontSize: 12,
          letterSpacing: '0.14em',
          color: 'var(--accent)',
          textShadow: '0 0 12px var(--accent)',
          zIndex: 2,
        }}
      >
        × {t({ en: 'CLOSE', zh: '关闭' })}
      </button>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(70px, 12vh, 120px) clamp(22px, 6vw, 72px) 120px' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14 }}>
          {t(categories.find((c) => c.key === project.category)!.label)} · {project.year}
        </div>
        <h2 style={{ fontSize: 'clamp(36px, 7vw, 76px)', fontWeight: 800, letterSpacing: '-0.025em', color: '#fff', lineHeight: 0.95, marginBottom: 14 }}>
          {project.name}
        </h2>
        <div style={{ fontSize: 13, letterSpacing: '0.06em', color: 'var(--accent)', opacity: 0.85, marginBottom: 28 }}>{project.stack}</div>

        <div
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid rgba(56,217,255,0.2)',
            boxShadow: '0 30px 90px rgba(0,0,0,0.6), 0 0 60px rgba(56,217,255,0.12)',
            marginBottom: 32,
            background: '#05080c',
          }}
        >
          {project.image ? (
            <img src={project.image} alt={project.name} style={{ width: '100%', display: 'block' }} />
          ) : (
            <div className="orbit-generated detail-generated">
              <span>{project.name}</span>
            </div>
          )}
        </div>

        <p style={{ fontSize: 'clamp(15px, 2vw, 19px)', lineHeight: 1.6, color: 'var(--fg)', opacity: 0.85, maxWidth: 720, marginBottom: 32 }}>
          {t(project.blurb)}
        </p>

        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          {project.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 13,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                border: '1px solid rgba(56,217,255,0.4)',
                borderRadius: 999,
                padding: '12px 24px',
              }}
            >
              {t(l.label)} -&gt;
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
