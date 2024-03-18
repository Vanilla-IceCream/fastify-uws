import { createServer } from 'node:http';
import { createApp, createRouter, defineEventHandler, useBase, toNodeListener } from 'h3';

const router = createRouter();

router.get(
  '/hello-world',
  defineEventHandler(() => {
    return { message: 'Hello, World!' };
  }),
);

const app = createApp();

app.use(useBase('/api', router.handler));

createServer(toNodeListener(app)).listen(3000, '127.0.0.1', () => {
  console.log(`Server listening at http://127.0.0.1:3000`);
});

// $ node h3.js
// $ curl http://127.0.0.1:3000/api/hello-world
