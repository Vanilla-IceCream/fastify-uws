import { Application, Router } from 'oak';

const router = new Router({ prefix: '/api' });

router.get('/hello-world', (ctx) => {
  ctx.response.body = { message: 'Hello, World!' };
});

const app = new Application();
app.use(router.routes(), router.allowedMethods());

app.addEventListener('listen', () => {
  console.log(`Server listening at http://0.0.0.0:3000`);
});

await app.listen({ hostname: '0.0.0.0', port: 3000 });
