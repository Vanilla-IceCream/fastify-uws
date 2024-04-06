import { createServer } from 'node:http';
import { createApp, createRouter, defineEventHandler, toNodeListener } from 'h3';

const router = createRouter();

router.get(
  '/hello-world',
  defineEventHandler(() => {
    return { message: 'Hello, World!' };
  }),
);

const app = createApp();

app.use('/api', router.handler);

createServer(toNodeListener(app)).listen(3000, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:3000`);
});
