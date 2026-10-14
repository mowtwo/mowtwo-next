import { useEffect, useRef, useState } from 'react'
import { profile, topics } from '../data/content'
import { useLocale } from '../i18n/context'

const BOOT = { en: '//  m2.core online  //  ask the machine anything', zh: '//  m2.core 已上线  //  有什么想问这台机器的' }

export default function Console() {
  const { t } = useLocale()
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [typed, setTyped] = useState('')
  const typeTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!response) return
    let i = 0
    const run = () => {
      i++
      setTyped(response.slice(0, i))
      if (i < response.length) typeTimer.current = window.setTimeout(run, 13)
    }
    run()
    return () => {
      if (typeTimer.current) clearTimeout(typeTimer.current)
    }
  }, [response])

  function answer(q: string) {
    const s = q.toLowerCase()
    if (/contact|email|reach|hire|github|联系|邮箱/.test(s)) {
      setResponse(`${profile.links.email} · github.com/mowtwo — ${t({ en: 'see Act VI.', zh: '见第六幕。' })}`)
      return
    }
    if (/who|you|about|name|m2|chen|rankai|now|你是|谁|名字/.test(s)) {
      setResponse(t(profile.nowLine))
      return
    }
    const hit = topics.find((x) => x.keywords.some((k) => s.includes(k)))
    setResponse(hit ? t(hit.answer) : `${t({ en: 'no direct match. try:', zh: '没找到，试试：' })} ${topics.map((x) => t(x.label)).join(' · ')}`)
  }

  return (
    <div style={{ pointerEvents: 'auto', maxWidth: 'min(92vw, 520px)', animation: 'fadeIn 1.6s ease 0.5s both' }}>
      <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: '0.12em', marginBottom: 10 }}>{t(BOOT)}</div>

      {/* staircase navigation — each step indents further */}
      <div style={{ display: 'grid', gap: 3, marginBottom: 16 }}>
        {topics.map((topic, i) => (
          <button
            key={topic.key}
            onClick={() => setResponse(t(topic.answer))}
            className="topic step"
            style={{
              marginLeft: i * 24,
              width: 'fit-content',
              textAlign: 'left',
              fontSize: 13,
              color: 'var(--fg)',
              opacity: 0.82,
              letterSpacing: '0.04em',
            }}
          >
            <span style={{ color: 'var(--accent)', opacity: 0.7 }}>-&gt;</span> {t(topic.label)}
          </button>
        ))}
      </div>

      {typed && (
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.5,
            color: 'var(--accent)',
            marginBottom: 14,
            minHeight: 20,
            maxWidth: 480,
            textShadow: '0 0 10px rgba(56,217,255,0.25)',
          }}
        >
          {typed}
          <span className="caret">▋</span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (query.trim()) answer(query.trim())
        }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 440 }}
      >
        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>&gt;&gt;&gt;</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t({ en: 'Ask me anything…', zh: '随便问点什么…' })}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(56,217,255,0.3)',
            color: 'var(--fg)',
            fontFamily: 'var(--mono)',
            fontSize: 14,
            padding: '8px 2px',
            outline: 'none',
          }}
        />
      </form>
    </div>
  )
}
