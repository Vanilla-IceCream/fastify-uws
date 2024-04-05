import { Hono } from 'hono';

const router = new Hono();

router.get('/hello-world', async (ctx) => {
  return ctx.json({ message: 'Hello, World!' });
});

const app = new Hono();

app.route('/api', router);

const server = Bun.serve({
  hostname: '0.0.0.0',
  port: 3000,
  fetch: app.fetch,
});

console.log(`Server listening at http://${server.hostname}:${server.port}`);

process.on('SIGINT', () => {
  process.exit();
});
