import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage for Zustand persist
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Helper to get localStorage mock
export const getLocalStorageMock = () => localStorageMock;

// Reset stores between tests
beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});
