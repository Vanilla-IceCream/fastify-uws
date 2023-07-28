import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

export default (async (app) => {
  app.get('', { websocket: true }, (con) => {
    console.log('Client connected');

    con.socket.send('Hello from Fastify uWS!');

    con.socket.on('message', (message: MessageEvent) => {
      console.log(`Client message: ${message}`);
    });

    con.socket.on('close', () => {
      console.log('Client disconnected');
    });
  });
}) as FastifyPluginAsyncTypebox;
