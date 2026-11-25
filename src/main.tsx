import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ensureCdlAbOnlyMigration } from './lib/storage'
import { ensureDemoDrivers } from './lib/seedDemoDrivers'
import { ensureDemoRecruiter } from './lib/seedDemoRecruiter'
import { ensureSlcHiringCompanies } from './lib/seedSlcHiringCompanies'
import App from './App'
import './index.css'

ensureCdlAbOnlyMigration()
ensureDemoDrivers()
ensureDemoRecruiter()
ensureSlcHiringCompanies()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
