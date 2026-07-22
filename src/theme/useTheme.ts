import { useCallback, useState } from 'react'

export type ThemeName = 'good' | 'evil'

const THEME_STORAGE_KEY = 'h2mp-theme'

function readTheme(): ThemeName {
  if (typeof document === 'undefined') {
    return 'good'
  }
  return document.documentElement.getAttribute('data-theme') === 'evil' ? 'evil' : 'good'
}

function applyTheme(theme: ThemeName): void {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // localStorage unavailable — the choice just won't persist.
  }
}

export interface ThemeApi {
  readonly theme: ThemeName
  readonly setTheme: (theme: ThemeName) => void
  readonly toggleTheme: () => void
}

/** Reads/sets the `data-theme` attribute set pre-paint in index.html; persists the choice. */
export function useTheme(): ThemeApi {
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
