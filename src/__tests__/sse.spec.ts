import sse from '@fastify/sse';
import type { FastifyInstance } from 'fastify';
import fastify from 'fastify';

import helloSse from '../../examples/src/routes/hello-sse/+handler';
import { serverFactory } from '../fastify-uws';

let app: FastifyInstance;

beforeEach(() => {
  app = fastify({ serverFactory });
});

test('SSE', async () => {
  app.register(sse);

  app.register(helloSse, { prefix: '/hello-sse' });

  const response = await app.inject({
    method: 'GET',
    url: '/hello-sse',
    headers: {
      accept: 'text/event-stream',
    },
  });

  const body = response.body;
  expect(body.includes('data: "Hello from Fastify!"')).toBe(true);
});
