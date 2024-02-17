import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

export default (async (app) => {
  // node client-fd.mjs
  app.post(
    '',
    {
      schema: {
        response: {
          200: Type.Object({
            message: Type.String(),
            filename: Type.Optional(Type.String()),
          }),
        },
      },
    },
    async (req, reply) => {
      const data = await req.file();

      return reply.send({
        message: 'OK',
        filename: data?.filename,
      });
    },
  );
}) as FastifyPluginAsyncTypebox;
