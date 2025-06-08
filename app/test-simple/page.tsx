'use client';

import { useState } from 'react';

export default function TestSimplePage() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log('Button clicked!');
    setCount(prev => prev + 1);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple React Test</h1>
      <p className="mb-4">Count: {count}</p>
      <button 
        onClick={handleClick}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Click me! 
      </button>
    </div>
  );
}