'use client';

import { useState, useEffect } from 'react';

export default function HydrationTest() {
  const [isClient, setIsClient] = useState(false);
  const [count, setCount] = useState(0);
  const [hydrationError, setHydrationError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔷 HydrationTest: useEffect called - client side mounted');
    setIsClient(true);
    
    // Listen for hydration errors
    const handleError = (event: ErrorEvent) => {
      console.error('🔷 HydrationTest: Error event:', event);
      setHydrationError(event.message);
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  console.log('🔷 HydrationTest: Rendering, isClient:', isClient, 'count:', count);

  if (!isClient) {
    console.log('🔷 HydrationTest: Server-side render');
    return (
      <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '10px' }}>
        <h3>🔷 Hydration Test (Server)</h3>
        <p>Loading...</p>
      </div>
    );
  }

  console.log('🔷 HydrationTest: Client-side render');

  return (
    <div style={{ padding: '20px', backgroundColor: '#e6f3ff', margin: '10px', border: '2px solid #007bff' }}>
      <h3>🔷 Hydration Test (Client)</h3>
      <p>✅ Client-side hydrated successfully!</p>
      <p>Count: {count}</p>
      {hydrationError && (
        <p style={{ color: 'red' }}>❌ Hydration Error: {hydrationError}</p>
      )}
      <button
        onClick={() => {
          console.log('🔷 HydrationTest: Button clicked!');
          setCount(prev => {
            console.log('🔷 HydrationTest: Updating count from', prev, 'to', prev + 1);
            return prev + 1;
          });
        }}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Hydrated Click Test ({count})
      </button>
      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        <p>✅ Client hydrated: {isClient ? 'YES' : 'NO'}</p>
        <p>✅ React state: {count}</p>
        <p>✅ Current time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}