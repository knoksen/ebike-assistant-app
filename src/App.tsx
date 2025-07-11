import React, { useState } from 'react';

const defaultMessages = [
  { from: 'ai', text: \"Hello! I'm your E-Bike Assistant. What can I help you with today?\" },
];

export default function App() {
  const [dark, setDark] = useState(false);
  const [messages, setMessages] = useState(defaultMessages);
  const [input, setInput] = useState('');

  function toggleTheme() {
    setDark((d) => !d);
    document.documentElement.classList.toggle('dark', !dark);
  }

  function send() {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        { from: 'ai', text: \"(AI) That's a great question about: \" + msgs[msgs.length - 1].text },
      ]);
    }, 900);
  }

  return (
    <div className={\min-h-screen transition-colors bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200\}>
      <header className=\"bg-white dark:bg-gray-800 shadow flex justify-between items-center px-6 py-4\">
        <div className=\"flex items-center space-x-3\">
          <span className=\"text-3xl text-green-500\">??</span>
          <h1 className=\"font-bold text-xl\">E-Bike<span className=\"text-green-500\">Pro</span></h1>
        </div>
        <button onClick={toggleTheme} className=\"rounded-full p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600\">
          <span className={dark ? '' : 'hidden'}>??</span>
          <span className={dark ? 'hidden' : ''}>??</span>
        </button>
      </header>
      <main className=\"max-w-2xl mx-auto py-10 px-4\">
        <section className=\"mb-8 bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-xl shadow-lg text-white\">
          <h2 className=\"text-2xl md:text-3xl font-bold mb-2\">AI-Powered E-Bike & Scooter Repair Assistant</h2>
          <p className=\"mb-4\">Diagnose issues, get step-by-step repair guides, and optimize performance.</p>
          <div className=\"flex gap-3\">
            <button className=\"bg-white text-green-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 shadow\">Start Diagnostic</button>
            <button className=\"bg-white/30 text-white font-semibold px-4 py-2 rounded-lg hover:bg-white/50 shadow border border-white\">Order Parts</button>
          </div>
        </section>

        <section className=\"mb-10 grid grid-cols-1 md:grid-cols-2 gap-4\">
          <div className=\"bg-white dark:bg-gray-800 rounded-xl shadow-md p-5\">
            <h3 className=\"font-bold mb-2\">?? Quick Diagnostics</h3>
            <p className=\"text-sm text-gray-600 dark:text-gray-300\">Automatic/manual tests for all models.</p>
          </div>
          <div className=\"bg-white dark:bg-gray-800 rounded-xl shadow-md p-5\">
            <h3 className=\"font-bold mb-2\">??? Repair Guides</h3>
            <p className=\"text-sm text-gray-600 dark:text-gray-300\">Step-by-step for batteries, motors, controllers, and more.</p>
          </div>
        </section>

        <section className=\"mb-12\">
          <div className=\"bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md\">
            <h3 className=\"font-bold mb-3\">?? Chat with your AI Repair Assistant</h3>
            <div className=\"h-64 overflow-y-auto border rounded p-2 mb-3 bg-gray-50 dark:bg-gray-900\">
              {messages.map((msg, i) => (
                <div key={i} className={\mb-2 \\}>
                  <span className={\inline-block px-3 py-2 rounded-lg text-sm \\}>
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>
            <div className=\"flex\">
              <input className=\"flex-grow px-3 py-2 rounded-l bg-gray-100 dark:bg-gray-700 focus:outline-none\" placeholder=\"Type your question…\" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
              <button onClick={send} className=\"bg-green-500 hover:bg-green-600 text-white px-4 rounded-r\">Send</button>
            </div>
          </div>
        </section>

        <div className=\"text-center mt-8\">
          <a href=\"https://github.com/knoksen/ebike-assistant-app\" target=\"_blank\" rel=\"noopener\" className=\"inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow\">See Project on GitHub</a>
        </div>
      </main>
      <footer className=\"mt-10 text-center text-xs text-gray-400\">© 2025 E-BikePro. All rights reserved.</footer>
    </div>
  );
}
