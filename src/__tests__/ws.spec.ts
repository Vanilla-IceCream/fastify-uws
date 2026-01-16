import websocket from '@fastify/websocket';
import type { FastifyInstance } from 'fastify';
import fastify from 'fastify';

import helloWs from '../../examples/src/routes/hello-ws/+handler';
import { serverFactory } from '../fastify-uws';

let app: FastifyInstance;

beforeEach(() => {
  app = fastify({ serverFactory });
});

test('WS', async () => {
  app.register(websocket);

  app.register(helloWs, { prefix: '/hello-ws' });

  await app.ready();
  const ws = await app.injectWS('/hello-ws');

  let resolve: (value: string) => void;

  const promise = new Promise<string>((_resolve) => {
    resolve = _resolve;
  });

  ws.on('message', (data: MessageEvent) => {
    resolve(data.toString());
  });

  ws.send('Hi from Test!');

  expect(await promise).toEqual('Hello from Fastify!');

  ws.terminate();
});
