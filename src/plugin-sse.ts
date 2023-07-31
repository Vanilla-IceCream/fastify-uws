import type { FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

export default fp(
  async (instance, options) => {
    instance.decorateReply('sse', function (this: FastifyReply, source) {
      if (!this.raw.headersSent) {

      }
    });
  },
  {
    fastify: '>= 4.0.0',
    name: '@fastify/eventsource',
  },
);
