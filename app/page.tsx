'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    console.log('🔥 HomePage useEffect running!');
    setMounted(true);
  }, []);

  const handleClick = () => {
    console.log('🔥 Click handler works!');
    setClicks(prev => prev + 1);
  };

  return (
    <div>
      <h1>React Event Test</h1>
      <p>If you see this, the app is working.</p>
      
      <div className="fixed top-4 right-4 bg-yellow-500 text-black p-2 rounded text-xs z-50">
        <div>Debug: {typeof window !== 'undefined' ? 'CLIENT' : 'SERVER'}</div>
        <div>Mounted: {mounted ? 'YES' : 'NO'}</div>
        <div>Clicks: {clicks}</div>
        <button 
          onClick={handleClick}
          className="bg-blue-500 text-white px-2 py-1 rounded mt-1"
        >
          Test Click
        </button>
      </div>
    </div>
  );
}
