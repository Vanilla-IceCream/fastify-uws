import { Hono } from 'hono';

const router = new Hono();

router.get('/hello-world', async (ctx) => {
  return ctx.json({ message: 'Hello, World!' });
});

const app = new Hono();

app.route('/api', router);

Deno.serve(
  {
    hostname: '127.0.0.1',
    port: 3000,
    onListen({ hostname, port }) {
      console.log(`Server listening at http://${hostname}:${port}`);
    },
  },
  app.fetch,
);

// $ deno run -A hono.ts
// $ curl http://127.0.0.1:3000/api/hello-world
