import React, { useEffect, useState } from 'react'
import './Header.css'

const Header: React.FC = () => {
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <header className="header">
      <h1 className="header-title">E-BikePro</h1>
      <button
        onClick={() => setDark(v => !v)}
        className="dark-toggle"
        title="Toggle dark mode"
      >
        {dark ? '🌙' : '☀️'}
      </button>
    </header>
  )
}

export default Header
