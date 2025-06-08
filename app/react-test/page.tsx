'use client';

import { useState } from 'react';

export default function ReactTest() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Initial state');

  console.log('🟢 ReactTest: Component rendered, count:', count);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🟢 React Hydration Test</h1>
      
      <div style={{ padding: '15px', backgroundColor: '#e6ffe6', border: '2px solid green', margin: '10px 0' }}>
        <h3>✅ React State Test</h3>
        <p><strong>Count:</strong> {count}</p>
        <p><strong>Message:</strong> {message}</p>
        
        <button 
          onClick={() => {
            console.log('🟢 Count button clicked, current:', count);
            setCount(prev => prev + 1);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Count: {count}
        </button>
        
        <button 
          onClick={() => {
            const newMsg = `Updated at ${new Date().toLocaleTimeString()}`;
            console.log('🟢 Message button clicked, setting:', newMsg);
            setMessage(newMsg);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Update Message
        </button>
        
        <button 
          onClick={() => {
            console.log('🟢 Alert button clicked');
            alert('🎉 React hydration is working!');
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Alert
        </button>
      </div>
      
      <div style={{ padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #ccc' }}>
        <h4>🔍 Debug Info</h4>
        <p>Component render count: Check console</p>
        <p>Current time: {new Date().toLocaleTimeString()}</p>
        <p>React version: {React.version || 'Unknown'}</p>
      </div>
    </div>
  );
}