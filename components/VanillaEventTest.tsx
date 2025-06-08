'use client';

import { useEffect } from 'react';

export default function VanillaEventTest() {
  useEffect(() => {
    console.log('🔥 VanillaEventTest mounting!');
    
    // Create a vanilla JS button
    const button = document.createElement('button');
    button.textContent = 'Vanilla JS Test';
    button.style.cssText = `
      position: fixed;
      top: 4px;
      left: 4px;
      background: orange;
      color: white;
      padding: 8px;
      border: none;
      border-radius: 4px;
      z-index: 9999;
      font-size: 12px;
    `;
    
    button.addEventListener('click', () => {
      console.log('🔥 VANILLA JS CLICK WORKS!');
      alert('Vanilla JS click works!');
    });
    
    document.body.appendChild(button);
    
    // Test global scroll
    const scrollHandler = () => {
      console.log('🔥 VANILLA JS SCROLL WORKS!', window.scrollY);
    };
    
    window.addEventListener('scroll', scrollHandler);
    
    return () => {
      console.log('🔥 VanillaEventTest cleanup');
      document.body.removeChild(button);
      window.removeEventListener('scroll', scrollHandler);
    };
  }, []);

  return null;
}