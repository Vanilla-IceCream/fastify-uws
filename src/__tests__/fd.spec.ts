import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';
import multipart from '@fastify/multipart';
import type { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import FormData from 'form-data';

import { serverFactory } from '../fastify-uws';

let app: FastifyInstance;

beforeEach(() => {
  app = fastify({ serverFactory });
});

test('FD', async () => {
  app.register(multipart);

  app.register(
    async (router) => {
      router.post('', async (req, reply) => {
        const data = await req.file();

        return reply.send({
          message: 'OK',
          filename: data?.filename,
        });
      });
    },
    { prefix: '/hello-fd' },
  );

  const formData = new FormData();
  formData.append('image', createReadStream(resolve(__dirname, '../../fastify.png')));

  const res = await app.inject({
    method: 'POST',
    url: '/hello-fd',
    headers: { ...formData.getHeaders() },
    body: formData,
  });

  expect(res.json()).toEqual({ message: 'OK', filename: 'fastify.png' });
});
