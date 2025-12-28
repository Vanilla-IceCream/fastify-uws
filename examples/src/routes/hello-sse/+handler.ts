import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

export default (async (app) => {
  // $ node client-es.mjs
  app.get('', { sse: true }, async (req, reply) => {
    app.log.info('Client connected');

    let index = 0;
    await reply.sse.send({ id: String(index), data: `Some message ${index}` });

    const interval = setInterval(async () => {
      if (reply.sse.isConnected) {
        index += 1;

        await reply.sse.send({ id: String(index), data: `Some message ${index}` });

        if (index === 10) {
          clearInterval(interval);
        }
      } else {
        clearInterval(interval);
      }
    }, 1000);

    reply.sse.onClose(() => {
      clearInterval(interval);
      app.log.info('Client disconnected');
    });
  });
}) as FastifyPluginAsyncTypebox;
