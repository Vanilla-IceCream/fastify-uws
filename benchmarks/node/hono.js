import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const router = new Hono();

router.get('/hello-world', async (ctx) => {
  return ctx.json({ message: 'Hello, World!' });
});

const app = new Hono();

app.route('/api', router);

serve({
  hostname: '127.0.0.1',
  port: 3000,
  fetch: app.fetch,
});

console.log(`Server listening at http://127.0.0.1:3000`);

// $ node hono.js
// $ curl http://127.0.0.1:3000/api/hello-world
