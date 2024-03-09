import type { FastifyInstance } from 'fastify';
import fastify from 'fastify';

import { serverFactory, websocket } from '../fastify-uws';

let app: FastifyInstance;

beforeEach(() => {
  app = fastify({ serverFactory });
});

test('WS', async () => {
  const app = fastify();

  app.register(websocket);

  app.register(
    async (_app) => {
      _app.get('', { websocket: true }, (con) => {
        app.log.info('Client connected');

        con.socket.on('message', (message: MessageEvent) => {
          console.log(`Client message: ${message}`);
          con.socket.send('Hello from Fastify!');
        });

        con.socket.on('close', () => {
          _app.log.info('Client disconnected');
        });
      });
    },
    { prefix: '/echo' },
  );

  await app.ready();
  const ws = await app.injectWS('/echo');

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
