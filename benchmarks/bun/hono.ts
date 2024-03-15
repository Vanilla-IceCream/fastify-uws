import { Hono } from 'hono';

const router = new Hono();

router.get('/hello-world', async (ctx) => {
  return ctx.json({ message: 'Hello, World!' });
});

const app = new Hono();

app.route('/api', router);

const server = Bun.serve({
  hostname: '127.0.0.1',
  port: 3000,
  fetch: app.fetch,
});

console.log(`Server listening at http://${server.hostname}:${server.port}`);

// $ bun hono.ts
// $ curl http://127.0.0.1:3000/api/hello-world
