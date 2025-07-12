import React, { useEffect, useState } from 'react'

const Header: React.FC = () => {
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <header className="bg-white text-[#213547] shadow p-3 px-4 flex justify-between items-center dark:bg-[#1a1a1a] dark:text-white">
      <h1 className="text-lg font-semibold">E-BikePro</h1>
      <button
        onClick={() => setDark(v => !v)}
        className="border-0 bg-transparent p-1.5 rounded-full cursor-pointer text-xl"
        title="Toggle dark mode"
      >
        {dark ? '🌙' : '☀️'}
      </button>
    </header>
  )
}

export default Header
