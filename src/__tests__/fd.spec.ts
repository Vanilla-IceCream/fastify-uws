import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';
import multipart from '@fastify/multipart';
import type { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import FormData from 'form-data';

import helloFd from '../../examples/src/routes/hello-fd/+handler';
import { serverFactory } from '../fastify-uws';

let app: FastifyInstance;

beforeEach(() => {
  app = fastify({ serverFactory });
});

test('FD', async () => {
  app.register(multipart);

  app.register(helloFd, { prefix: '/hello-fd' });

  const formData = new FormData();
  formData.append('image', createReadStream(resolve(__dirname, '../../.github/assets/logo.png')));

  const res = await app.inject({
    method: 'POST',
    url: '/hello-fd',
    headers: { ...formData.getHeaders() },
    body: formData,
  });

  expect(res.json()).toEqual({ message: 'OK', filename: 'logo.png' });
});
