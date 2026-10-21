import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router'
import App from './App.tsx'
import './index.css'

// HashRouter：GitHub Pages 无 history fallback，browser router 深链接会 404
// （路由决策记录见 vesta-redesign.md 5.2；迁自有域后可换 BrowserRouter）
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
