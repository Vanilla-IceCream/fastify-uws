import type { FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

import { kWs, kRes } from './symbols';

export default fp(
  async (instance, options) => {
    instance.decorateReply('sse', function (this: FastifyReply, source) {
      const res = this.request.raw.socket[kRes];
    });
  },
  {
    fastify: '>= 4.0.0',
    name: '@fastify/eventsource',
  },
);
