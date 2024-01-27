import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

export default (async (app) => {
  // node client-ws.mjs
  app.get('', { websocket: true }, (con) => {
    console.log('Client connected');

    con.socket.send('Hello from Fastify uWS!');

    con.socket.on('message', (message) => {
      const decoder = new TextDecoder();
      const str = decoder.decode(message);
      console.log(`Client message: ${str}`);
    });

    con.socket.on('close', () => {
      console.log('Client disconnected');
    });
  });
}) as FastifyPluginAsyncTypebox;
