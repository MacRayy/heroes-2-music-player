import { createContext, type PropsWithChildren, type ReactElement, useContext } from 'react'

import { type ThemeApi, useTheme } from './useTheme'

const ThemeContext = createContext<ThemeApi | null>(null)

export const ThemeProvider = ({ children }: PropsWithChildren): ReactElement => {
  const theme = useTheme()
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export const useThemeContext = (): ThemeApi => {
  const ctx = useContext(ThemeContext)
  if (ctx === null) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return ctx
}
