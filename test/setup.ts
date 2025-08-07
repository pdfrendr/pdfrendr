// Test setup file
import { vi } from 'vitest';

// Global test environment setup
Object.defineProperty(globalThis, 'window', {
  value: { 
    document: {},
    HTMLCanvasElement: class MockCanvas {
      getContext() { return mockCanvasContext; }
      toDataURL() { return 'data:image/png;base64,mock-data'; }
    }
  },
  writable: true,
});

Object.defineProperty(globalThis, 'document', {
  value: { 
    createElement: vi.fn(() => ({
      getContext: vi.fn(() => mockCanvasContext),
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-data'),
    }))
  },
  writable: true,
});

// Mock canvas context
const mockCanvasContext = {
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 10 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
};

// Setup canvas mocking if HTMLCanvasElement exists
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCanvasContext);
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mock-data');
}

// Mock URL APIs
global.URL = global.URL || {};
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock base64 operations
global.atob = global.atob || vi.fn((str) => str);
global.btoa = global.btoa || vi.fn((str) => str);

// Silence console warnings during tests
const originalWarn = console.warn;
const originalError = console.error;

console.warn = vi.fn((...args) => {
  // Only show warnings that aren't about canvas or PDF.js worker
  const message = args[0]?.toString?.() || '';
  if (!message.includes('node-canvas') && 
      !message.includes('worker') && 
      !message.includes('PDF.js')) {
    originalWarn(...args);
  }
});

console.error = vi.fn((...args) => {
  // Only show errors that aren't about mocked modules
  const message = args[0]?.toString?.() || '';
  if (!message.includes('node-canvas') && 
      !message.includes('worker') && 
      !message.includes('Failed to resolve import')) {
    originalError(...args);
  }
});