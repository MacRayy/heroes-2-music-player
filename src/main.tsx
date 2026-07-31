import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import { App } from '@/App'
import '@/styles/globals.css'
import '@/theme/fonts.css'
import '@/theme/themes.css'
import '@/theme/tokens.css'

const rootElement = document.getElementById('root')
if (rootElement === null) {
  throw new Error('Root element #root not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// PROD-only: the dev server (and Playwright, which runs it) must not get a SW intercepting requests.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}
