import { Application, Router } from '@oak/oak';

const router = new Router({ prefix: '/api' });

router.get('/hello-world', (ctx) => {
  ctx.response.body = { message: 'Hello, World!' };
});

const app = new Application();
app.use(router.routes(), router.allowedMethods());

app.addEventListener('listen', () => {
  console.log(`Server listening at http://127.0.0.1:3000`);
});

await app.listen({ hostname: '127.0.0.1', port: 3000 });

// $ deno run -A oak.ts
// $ curl http://127.0.0.1:3000/api/hello-world
