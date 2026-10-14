import { createContext, useContext } from 'react'
import type { L, Locale } from './types.ts'

export type Ctx = { locale: Locale; setLocale: (l: Locale) => void; t: (s: L) => string }
export const LocaleContext = createContext<Ctx | null>(null)

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>')
  return ctx
}
