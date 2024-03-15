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

Deno.serve(
  {
    hostname: '127.0.0.1',
    port: 3000,
    onListen({ hostname, port }) {
      console.log(`Server listening at http://${hostname}:${port}`);
    },
  },
  toWebHandler(app),
);

// $ deno run -A h3.ts
// $ curl http://127.0.0.1:3000/api/hello-world
