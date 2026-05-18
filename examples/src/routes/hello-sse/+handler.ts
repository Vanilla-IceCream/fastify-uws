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

  app.get('/count', { sse: true }, async (request, reply) => {
    app.log.info('Client connected');

    async function* counter() {
      const count = 3;

      for (let i = 1; i <= count; i++) {
        yield { data: String(i) };

        if (i < count) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    await reply.sse.send(counter());

    await reply.sse.send({ event: 'end', data: null });

    request.raw.on('close', () => {
      app.log.info('Client disconnected');
    });
  });
}) as FastifyPluginAsyncTypebox;
