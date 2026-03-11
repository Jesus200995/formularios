import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import './index.css'

// Register Service Worker with update callback
const updateSW = registerSW({
  onNeedRefresh() {
    // Dispatch custom event when update available
    window.dispatchEvent(new CustomEvent('swUpdate', { detail: { updateSW } }))
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
  immediate: true
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
