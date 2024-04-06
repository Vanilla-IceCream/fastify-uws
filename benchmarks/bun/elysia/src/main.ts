import { Elysia } from 'elysia';

const router = new Elysia({ prefix: '/api' });

router.get('/hello-world', () => {
  return { message: 'Hello, World!' };
});

new Elysia().use(router).listen(
  {
    hostname: '0.0.0.0',
    port: 3000,
  },
  (server) => {
    console.log(`Server listening at ${server.url.origin}`);
  },
);
