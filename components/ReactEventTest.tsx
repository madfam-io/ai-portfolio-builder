'use client';

import { useState, useEffect, useLayoutEffect } from 'react';

export default function ReactEventTest() {
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // This should run on every render
  console.log('🔥 ReactEventTest RENDER!', { 
    mounted, 
    hydrated,
    timestamp: Date.now(),
    isClient: typeof window !== 'undefined'
  });

  // Try both useEffect and useLayoutEffect
  useLayoutEffect(() => {
    console.log('🔥 useLayoutEffect RUNNING!');
    setHydrated(true);
  }, []);

  useEffect(() => {
    console.log('🔥 useEffect RUNNING!');
    setMounted(true);
    return () => console.log('🔥 useEffect CLEANUP!');
  }, []);

  const handleClick = () => {
    console.log('🔥 CLICK HANDLER!');
    setMounted(prev => !prev); // Toggle to test state updates
  };

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg z-50 text-xs">
      <div className="font-bold mb-2">REACT DEBUG</div>
      <div className="mb-1">useEffect: {mounted ? 'YES' : 'NO'}</div>
      <div className="mb-1">useLayout: {hydrated ? 'YES' : 'NO'}</div>
      <div className="mb-1">Window: {typeof window !== 'undefined' ? 'YES' : 'NO'}</div>
      <div className="mb-2">Time: {Date.now()}</div>
      <button 
        onClick={handleClick}
        className="bg-blue-500 px-2 py-1 rounded mr-1 text-xs"
      >
        Toggle
      </button>
    </div>
  );
}