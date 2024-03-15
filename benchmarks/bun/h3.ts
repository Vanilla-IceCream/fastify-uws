import { createApp, createRouter, defineEventHandler, useBase, toWebHandler } from 'h3';

const router = createRouter();

router.get(
  '/hello-world',
  defineEventHandler(() => {
    return { message: 'Hello, World!' };
  }),
);

const app = createApp();

app.use(useBase('/api', router.handler));

const server = Bun.serve({
  hostname: '127.0.0.1',
  port: 3000,
  fetch: toWebHandler(app),
});

console.log(`Server listening at http://${server.hostname}:${server.port}`);

// $ bun h3.ts
// $ curl http://127.0.0.1:3000/api/hello-world
