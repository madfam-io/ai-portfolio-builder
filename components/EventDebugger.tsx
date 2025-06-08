'use client';

import { useEffect } from 'react';

export default function EventDebugger() {
  useEffect(() => {
    const debugClick = (e: Event) => {
      console.log('🔥 GLOBAL CLICK DEBUG:', {
        target: (e.target as Element)?.tagName,
        className: (e.target as Element)?.className,
        dataset: (e.target as HTMLElement)?.dataset || {},
        defaultPrevented: e.defaultPrevented,
        bubbles: e.bubbles,
        eventPhase: e.eventPhase,
        timeStamp: e.timeStamp,
      });
    };

    const debugScroll = () => {
      console.log('🔥 SCROLL DEBUG:', {
        scrollY: window.scrollY,
        backToTopButtons: document.querySelectorAll('.back-to-top-button').length,
        visibleButtons: document.querySelectorAll('.back-to-top-button.visible').length,
      });
    };

    // Add event listeners with capture to see everything
    document.addEventListener('click', debugClick, true); // Capture phase
    document.addEventListener('click', debugClick, false); // Bubble phase
    window.addEventListener('scroll', debugScroll);

    return () => {
      document.removeEventListener('click', debugClick, true);
      document.removeEventListener('click', debugClick, false);
      window.removeEventListener('scroll', debugScroll);
    };
  }, []);

  return null;
}