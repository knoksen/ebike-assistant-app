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
import Header from './components/Header'
import { ThemeProvider } from './context/ThemeContext'
import './App.css'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
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
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}
