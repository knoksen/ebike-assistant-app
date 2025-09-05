// Removed triple-slash reference; Vite types are included via tsconfig "types".
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import DiagnosticsPage from './pages/Diagnostics'
import Parts from './pages/Parts'
import Maintenance from './pages/Maintenance'
import Guides from './pages/Guides'
import About from './pages/About'
import SettingsPage from './pages/Settings'
import { RideTrackerPage } from './pages/RideTracker'
import Tuneup from './pages/Tuneup'
import Boost from './pages/Boost'
import Header from './components/Header'
import MobileDock from './components/MobileDock'
import { ThemeProvider } from './context/ThemeContext'
import './App.css'

export default function App() {
  // Determine router basename robustly across environments:
  // - Vite dev: '/'
  // - Relative builds for Electron / static: './'
  // - GitHub Pages repo hosting: path starts with '/ebike-assistant-app/'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawBase: string = (import.meta as any).env.BASE_URL || '/'
  let basename = rawBase === './' || rawBase === '.' ? '/' : rawBase.replace(/\/$/, '')
  if (typeof window !== 'undefined') {
    const p = window.location.pathname
    if (basename === '/' && p.startsWith('/ebike-assistant-app/')) {
      basename = '/ebike-assistant-app'
    }
  }
  return (
    <ThemeProvider>
      <BrowserRouter basename={basename}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/diagnostics" element={<DiagnosticsPage />} />
              <Route path="/parts" element={<Parts />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/about" element={<About />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/rides" element={<RideTrackerPage />} />
              <Route path="/tuneup" element={<Tuneup />} />
              <Route path="/boost" element={<Boost />} />
              {/* Fallback: on unexpected path, show home instead of blank screen */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <MobileDock />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}
