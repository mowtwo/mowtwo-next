import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LocaleContext, type Ctx } from './context.ts'

import type { L, Locale } from './types.ts'
export type { L, Locale }

const KEY = 'm2.locale'

function initial(): Locale {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'en' || saved === 'zh') return saved
  } catch {
    /* storage blocked — fall through to the browser language */
  }
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}


export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initial)

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem(KEY, l)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
  }, [locale])

  const value = useMemo<Ctx>(() => ({ locale, setLocale, t: (s) => s[locale] }), [locale, setLocale])
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
