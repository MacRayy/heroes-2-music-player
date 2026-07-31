import { useCallback, useState } from 'react'

export type ThemeName = 'good' | 'evil'

const THEME_STORAGE_KEY = 'h2mp-theme'

// Mirror `--bg-base`; also duplicated in index.html's pre-paint IIFE (can't import) + the manifest.
const THEME_COLORS: Record<ThemeName, string> = { good: '#0a0f18', evil: '#100f0d' }

const readTheme = (): ThemeName => {
  if (typeof document === 'undefined') {
    return 'good'
  }
  return document.documentElement.getAttribute('data-theme') === 'evil' ? 'evil' : 'good'
}

const applyTheme = (theme: ThemeName): void => {
  document.documentElement.setAttribute('data-theme', theme)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* localStorage unavailable */
  }
}

export type ThemeApi = {
  readonly theme: ThemeName
  readonly setTheme: (theme: ThemeName) => void
  readonly toggleTheme: () => void
}

export const useTheme = (): ThemeApi => {
  const [theme, setThemeState] = useState<ThemeName>(readTheme)

  const setTheme = useCallback((next: ThemeName): void => {
    setThemeState(next)
    applyTheme(next)
  }, [])

  const toggleTheme = useCallback((): void => {
    setThemeState((prev) => {
      const next: ThemeName = prev === 'good' ? 'evil' : 'good'
      applyTheme(next)
      return next
    })
  }, [])

  return { theme, setTheme, toggleTheme }
}
