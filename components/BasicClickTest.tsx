'use client';

import { useState } from 'react';

export default function BasicClickTest() {
  const [clicks, setClicks] = useState(0);
  const [message, setMessage] = useState('Not clicked yet');

  const handleClick = () => {
    console.log('🟢 BasicClickTest: Button clicked!');
    setClicks(prev => prev + 1);
    setMessage(`Button clicked ${clicks + 1} times`);
    alert(`Button works! Clicked ${clicks + 1} times`);
  };

  return (
    <div className="fixed top-4 left-4 bg-green-600 text-white p-4 rounded-lg z-50">
      <h3 className="font-bold mb-2">🟢 Click Test</h3>
      <p className="text-sm mb-2">{message}</p>
      <button
        onClick={handleClick}
        className="bg-white text-green-600 px-4 py-2 rounded font-bold"
      >
        TEST CLICK ({clicks})
      </button>
    </div>
  );
}