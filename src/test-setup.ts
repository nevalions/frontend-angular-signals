import { vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.stubGlobal('TestBed', {
  initTestEnvironment: vi.fn(),
});

vi.stubGlobal('TestBedImpl', {
  getCompilerFacade: vi.fn(() => ({
    applyProviderOverridesInScope: vi.fn(),
  })),
});
