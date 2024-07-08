import { Hono } from '@hono/hono';

const router = new Hono();

router.get('/hello-world', async (ctx) => {
  return ctx.json({ message: 'Hello, World!' });
});

const app = new Hono();

app.route('/api', router);

Deno.serve(
  {
    hostname: '0.0.0.0',
    port: 3000,
    onListen({ hostname, port }) {
      console.log(`Server listening at http://${hostname}:${port}`);
    },
  },
  app.fetch,
);
