import type { FastifyInstance } from 'fastify';
import fastify from 'fastify';

import { serverFactory } from '../fastify-uws';

let app: FastifyInstance;

beforeEach(() => {
  app = fastify({ serverFactory });
});

test('HTTP - GET', async () => {
  app.register(
    async (router) => {
      router.get('', async (req, reply) => {
        return reply.send({
          message: 'Hello, World!',
        });
      });
    },
    { prefix: '/hello-http' },
  );

  const res = await app.inject({ method: 'GET', url: '/hello-http' });

  expect(res.json()).toEqual({ message: 'Hello, World!' });
});

test('HTTP - POST', async () => {
  app.register(
    async (router) => {
      router.post<{ Body: { text: string } }>('', async (req, reply) => {
        return reply.send({
          message: req.body.text,
        });
      });
    },
    { prefix: '/hello-http' },
  );

  const res = await app.inject({
    method: 'POST',
    url: '/hello-http',
    body: { text: 'Hello, World!' },
  });

  expect(res.json()).toEqual({ message: 'Hello, World!' });
});
