import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AfriGigApp from './afrigig-v3.jsx'

// Storage polyfill for AfriGig v3 (uses localStorage under the hood)
if (typeof window !== 'undefined' && !window.storage) {
  window.storage = {
    get(k) {
      const v = localStorage.getItem(k)
      return Promise.resolve(v != null ? { value: v } : null)
    },
    set(k, v) {
      localStorage.setItem(k, v)
      return Promise.resolve()
    },
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AfriGigApp />
  </StrictMode>,
)
