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
