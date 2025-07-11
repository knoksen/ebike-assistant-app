import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Diagnostics from './pages/Diagnostics'
import About from './pages/About'
import './App.css'
import { Diagnostics } from './components/Diagnostics'
import Header from './components/Header'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <nav>
        <Link to="/">Home</Link> |{' '}
        <Link to="/diagnostics">Diagnostics</Link> |{' '}
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diagnostics" element={<Diagnostics />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
function App() {
  return (
    <>
      <Header />
      <Diagnostics />
    </>
  )
}
