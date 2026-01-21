import { vi } from 'vitest';

if (typeof globalThis.fetch === 'function') {
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => '',
    arrayBuffer: async () => new ArrayBuffer(0),
    headers: new Headers(),
  })));
}

if (typeof window !== 'undefined' && 'XMLHttpRequest' in window) {
  class MockXMLHttpRequest {
    readyState = 0;
    status = 200;
    statusText = 'OK';
    responseType = '';
    response: unknown = null;
    responseText = '';
    onreadystatechange: ((ev: Event) => unknown) | null = null;
    onload: ((ev: Event) => unknown) | null = null;
    onerror: ((ev: Event) => unknown) | null = null;

    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
      const handler = typeof listener === 'function' ? listener : listener.handleEvent?.bind(listener);
      if (!handler) return;
      if (type === 'readystatechange') {
        this.onreadystatechange = handler;
      }
      if (type === 'load') {
        this.onload = handler;
      }
      if (type === 'error') {
        this.onerror = handler;
      }
    }

    removeEventListener(): void {
      return;
    }

    open(): void {
      this.readyState = 1;
    }

    setRequestHeader(): void {
      return;
    }

    send(): void {
      this.readyState = 4;
      this.responseText = '{}';
      this.response = this.responseType === 'json' ? {} : this.responseText;
      this.onreadystatechange?.(new Event('readystatechange'));
      this.onload?.(new Event('load'));
    }

    abort(): void {
      return;
    }
  }

  Object.defineProperty(window, 'XMLHttpRequest', {
    writable: true,
    value: MockXMLHttpRequest,
  });
  Object.defineProperty(globalThis, 'XMLHttpRequest', {
    writable: true,
    value: MockXMLHttpRequest,
  });
}

if (typeof window !== 'undefined' && window.HTMLImageElement) {
  Object.defineProperty(window.HTMLImageElement.prototype, 'src', {
    configurable: true,
    get() {
      return '';
    },
    set() {
      return;
    },
  });
}

const isConnResetError = (error: unknown): boolean => {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error as { code?: string }).code === 'ECONNRESET';
};

const originalConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  if (args.some(isConnResetError)) {
    return;
  }

  if (args.some((arg) => typeof arg === 'string' && arg.includes('ECONNRESET'))) {
    return;
  }

  originalConsoleError(...args);
};

const proc = (globalThis as { process?: { on?: (event: string, handler: (arg: unknown) => void) => void } }).process;

if (proc?.on) {
  proc.on('uncaughtException', (error: unknown) => {
    if (isConnResetError(error)) return;
    throw error;
  });

  proc.on('unhandledRejection', (reason: unknown) => {
    if (isConnResetError(reason)) return;
    throw reason;
  });
}

const procWithStderr = proc as { stderr?: { write?: (chunk: unknown, ...args: unknown[]) => boolean } } | undefined;
const originalStderrWrite = procWithStderr?.stderr?.write?.bind(procWithStderr.stderr);

if (procWithStderr?.stderr && originalStderrWrite) {
  procWithStderr.stderr.write = (chunk: unknown, ...args: unknown[]) => {
    const text = typeof chunk === 'string' ? chunk : chunk?.toString?.() ?? '';
    if (text.includes('ECONNRESET') || text.includes('socket hang up')) {
      return true;
    }
    return originalStderrWrite(chunk, ...args);
  };
}

const nodeRequire = (globalThis as { require?: (id: string) => unknown }).require;
const httpModule = typeof nodeRequire === 'function' ? nodeRequire('node:http') as { createServer?: (handler: (req: unknown, res: { statusCode?: number; setHeader?: (key: string, value: string) => void; end?: (body?: string) => void }) => void) => { listen?: (port: number) => void; on?: (event: string, handler: (error: unknown) => void) => void } } : undefined;

if (httpModule?.createServer) {
  const server = httpModule.createServer((_req, res) => {
    if (res.setHeader) {
      res.setHeader('Content-Type', 'application/json');
    }
    if (typeof res.statusCode === 'number') {
      res.statusCode = 200;
    }
    res.end?.('{}');
  });
  server.on?.('error', () => undefined);
  server.listen?.(9000);
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Mock IntersectionObserver
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
  })),
});

// Mock getComputedStyle for Taiga UI components
const originalGetComputedStyle = window.getComputedStyle;
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: vi.fn().mockImplementation((element, pseudoElt) => {
    return originalGetComputedStyle(element, pseudoElt);
  }),
});
