import { createApp, createRouter, defineEventHandler, toWebHandler } from 'h3';

const router = createRouter();

router.get(
  '/hello-world',
  defineEventHandler(() => {
    return { message: 'Hello, World!' };
  }),
);

const app = createApp();

app.use('/api', router.handler);

const server = Bun.serve({
  hostname: '0.0.0.0',
  port: 3000,
  fetch: toWebHandler(app),
});

console.log(`Server listening at http://${server.hostname}:${server.port}`);
