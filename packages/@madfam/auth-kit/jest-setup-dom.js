/**
 * DOM setup for React testing
 */

// Polyfill for TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock HTMLElement properly
if (!global.HTMLElement) {
  global.HTMLElement = class HTMLElement {
    constructor() {
      this.style = {};
      this.classList = {
        add: () => {},
        remove: () => {},
        contains: () => false,
      };
    }
  };
}

// Ensure window.Element exists
if (typeof window !== 'undefined' && !window.Element) {
  window.Element = class Element extends HTMLElement {};
}

// Mock Selection API
if (typeof window !== 'undefined' && !window.getSelection) {
  window.getSelection = () => ({
    removeAllRanges: () => {},
    addRange: () => {},
    getRangeAt: () => ({}),
    rangeCount: 0,
    toString: () => '',
  });
}

// Mock document.createRange
if (typeof document !== 'undefined' && !document.createRange) {
  document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
    selectNode: () => {},
    selectNodeContents: () => {},
  });
}

// Fix instanceof HTMLElement checks in jsdom
if (typeof window !== 'undefined' && window.HTMLElement) {
  // Store the original HTMLElement
  const OriginalHTMLElement = window.HTMLElement;
  
  // Create a wrapper that properly handles instanceof checks
  Object.defineProperty(window, 'HTMLElement', {
    configurable: true,
    writable: true,
    value: OriginalHTMLElement,
  });
  
  // Ensure the constructor property is set correctly
  if (window.HTMLElement.prototype) {
    window.HTMLElement.prototype.constructor = window.HTMLElement;
  }
}

// Mock requestAnimationFrame
if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
  window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
}