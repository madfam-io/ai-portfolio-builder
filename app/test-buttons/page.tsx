'use client';

import { useState } from 'react';

export default function TestButtonsPage() {
  const [count, setCount] = useState(0);
  const [language, setLanguage] = useState('es');

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-black">Button Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 border border-gray-300 rounded">
          <h2 className="text-xl font-bold mb-4">Basic Counter Test</h2>
          <p className="mb-4">Count: {count}</p>
          <button
            onClick={() => {
              console.log('Counter button clicked!');
              setCount(count + 1);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Click Me ({count})
          </button>
        </div>

        <div className="p-4 border border-gray-300 rounded">
          <h2 className="text-xl font-bold mb-4">Language Toggle Test</h2>
          <p className="mb-4">Current Language: {language}</p>
          <p className="mb-4 text-lg font-bold">
            {language === 'es' ? 'Texto en Español' : 'Text in English'}
          </p>
          <button
            onClick={() => {
              const newLang = language === 'es' ? 'en' : 'es';
              console.log('Language button clicked! Switching to:', newLang);
              setLanguage(newLang);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Switch to {language === 'es' ? 'English' : 'Español'}
          </button>
        </div>

        <div className="p-4 border border-gray-300 rounded">
          <h2 className="text-xl font-bold mb-4">Alert Test</h2>
          <button
            onClick={() => {
              console.log('Alert button clicked!');
              alert('Alert button works perfectly!');
            }}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Show Alert
          </button>
        </div>

        <div className="p-4 border border-gray-300 rounded">
          <h2 className="text-xl font-bold mb-4">Console Test</h2>
          <button
            onClick={() => {
              console.log('🟢 Console test button clicked at', new Date().toLocaleTimeString());
              console.log('🟢 Current language:', language);
              console.log('🟢 Current count:', count);
            }}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            Log to Console
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Open browser developer tools (F12)</li>
          <li>Go to Console tab</li>
          <li>Click each button above</li>
          <li>Check if console messages appear</li>
          <li>Verify state changes work</li>
        </ol>
      </div>
    </div>
  );
}