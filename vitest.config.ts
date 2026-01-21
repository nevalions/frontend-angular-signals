import { defineConfig } from 'vitest/config';
import { ResourceLoader } from 'jsdom';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        resources: new ResourceLoader({
          fetch: async () => Buffer.from(''),
        }),
      },
    },
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'src/main.ts',
        'src/app/app.config.ts',
        'src/app/app.routes.ts',
      ],
    },
  },
});
