import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Diagnostics from './pages/Diagnostics'
import Parts from './pages/Parts'
import About from './pages/About'
import './App.css'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <nav>
        <Link to="/">Home</Link> |{' '}
        <Link to="/diagnostics">Diagnostics</Link> |{' '}
        <Link to="/parts">Parts Search</Link> |{' '}
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diagnostics" element={<Diagnostics />} />
        <Route path="/parts" element={<Parts />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}
