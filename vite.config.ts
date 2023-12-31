import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import pkg from './package.json';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/fastify-uws.ts'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['fs', 'assert', 'http', 'path', 'events', ...Object.keys(pkg.dependencies)],
    },
  },
  plugins: [dts()],
  test: {
    globals: true,
    testTimeout: 10_000,
  },
});
