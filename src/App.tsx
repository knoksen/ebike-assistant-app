import React from 'react';

function App() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-white text-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:text-gray-100 transition-colors'>
      <header className='flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 shadow'>
        <div className='flex items-center space-x-2'>
          <span className='text-3xl text-green-500'>??</span>
          <h1 className='font-bold text-xl'>E-Bike<span className='text-green-500'>Pro</span></h1>
        </div>
        <span className='text-sm'>By knoksen</span>
      </header>
      <main className='max-w-2xl mx-auto mt-12 p-6 bg-white/70 dark:bg-gray-900/60 rounded-xl shadow-xl'>
        <h2 className='text-3xl font-bold mb-3'>AI-Powered E-Bike Assistant</h2>
        <p className='mb-6 text-gray-600 dark:text-gray-200'>
          Diagnose issues, get repair guides, and order parts—all with one click.
        </p>
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='bg-green-100 dark:bg-green-900/40 rounded p-4 flex flex-col items-start'>
            <span className='font-semibold mb-2'>?? Diagnostics</span>
            <span className='text-xs text-gray-700 dark:text-gray-200'>Instant troubleshooting for common problems.</span>
          </div>
          <div className='bg-blue-100 dark:bg-blue-900/40 rounded p-4 flex flex-col items-start'>
            <span className='font-semibold mb-2'>??? Repair Guides</span>
            <span className='text-xs text-gray-700 dark:text-gray-200'>Step-by-step guides for DIY fixes.</span>
          </div>
        </div>
        <div className='mt-8 text-center'>
          <a href='https://github.com/knoksen/ebike-assistant-app' target='_blank' rel='noopener' className='inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow'>See on GitHub</a>
        </div>
      </main>
      <footer className='mt-12 text-center text-xs text-gray-400'>© 2025 E-BikePro. All rights reserved.</footer>
    </div>
  );
}

export default App;
