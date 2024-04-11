import type { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import websocket from '@fastify/websocket';

import { serverFactory } from '../fastify-uws';

let app: FastifyInstance;

beforeEach(() => {
  app = fastify({ serverFactory });
});

test('WS', async () => {
  app.register(websocket);

  app.register(
    async (_app) => {
      _app.get('', { websocket: true }, (socket) => {
        app.log.info('Client connected');

        socket.on('message', (message: MessageEvent) => {
          console.log(`Client message: ${message}`);
          socket.send('Hello from Fastify!');
        });

        socket.on('close', () => {
          _app.log.info('Client disconnected');
        });
      });
    },
    { prefix: '/hello-ws' },
  );

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
