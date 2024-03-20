import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import nodeExternals from 'rollup-plugin-node-externals';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/fastify-uws.ts'),
      formats: ['es', 'cjs'],
    },
  },
  plugins: [
    dts({
      exclude: ['**/__tests__/**'],
    }),
    {
      ...nodeExternals(),
      enforce: 'pre',
      apply: 'build',
    },
  ],
  test: {
    globals: true,
  },
});
