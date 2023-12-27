import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

export default (async (app) => {
  app.post('', async (req, reply) => {
    // const data = await req.file();

    // data.file; // stream

    return reply.send({
      message: 'Hello, World!',
    });
  });
}) as FastifyPluginAsyncTypebox;
