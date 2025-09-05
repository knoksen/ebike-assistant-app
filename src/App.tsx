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
  return (
    <ThemeProvider>
  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
  <BrowserRouter basename={(import.meta as any).env.BASE_URL}>
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
            </Routes>
          </main>
          <MobileDock />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}
