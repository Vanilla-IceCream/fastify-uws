import path from 'path';
import { defineConfig } from 'vite';
import fastify from 'vite-plugin-fastify';
import fastifyRoutes from 'vite-plugin-fastify-routes';

export default defineConfig({
  plugins: [
    fastify({
      devMode: false,
    }),
    fastifyRoutes(),
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
});
