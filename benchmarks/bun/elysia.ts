import { Elysia } from 'elysia';

const router = new Elysia({ prefix: '/api' });

router.get('/hello-world', () => {
  return { message: 'Hello, World!' };
});

new Elysia().use(router).listen(
  {
    hostname: '127.0.0.1',
    port: 3000,
  },
  (server) => {
    console.log(`Server listening at ${server.url.origin}`);
  },
);

// $ bun elysia.ts
// $ curl http://127.0.0.1:3000/api/hello-world
