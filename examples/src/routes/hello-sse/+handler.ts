import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

export default (async (app) => {
  // $ node client-es.mjs
  app.get('', { sse: true }, async (request, reply) => {
    app.log.info('Client connected');

    await reply.sse.send({ data: 'Hello from Fastify!' });

    request.raw.on('close', () => {
      app.log.info('Client disconnected');
    });
  });
}) as FastifyPluginAsyncTypebox;
