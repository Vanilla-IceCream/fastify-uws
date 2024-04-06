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

Deno.serve(
  {
    hostname: '0.0.0.0',
    port: 3000,
    onListen({ hostname, port }) {
      console.log(`Server listening at http://${hostname}:${port}`);
    },
  },
  toWebHandler(app),
);
