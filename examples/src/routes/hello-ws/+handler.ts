import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

export default (async (app) => {
  // node client-ws.mjs
  app.get('', { websocket: true }, (con) => {
    console.log('Client connected');

    con.socket.send('Hello from Fastify uWS!');

    con.socket.on('message', (message) => {
      console.log(`Client message: ${message.toString()}`);
      con.socket.send('Got.');
    });

    con.socket.on('close', () => {
      console.log('Client disconnected');
    });
  });
}) as FastifyPluginAsyncTypebox;
