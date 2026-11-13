import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { isLocal } from './core/data/mode'
import { captureInstallPrompt } from './core/phone/install'

if (isLocal()) captureInstallPrompt()
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
)
