import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';

export default (async (app) => {
  // $ node client-fd.mjs
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

      if (!data) return reply.code(400);

      const dir = path.resolve(import.meta.dirname, '../../../dist');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      await pipeline(data.file, fs.createWriteStream(path.resolve(dir, data.filename)));

      return reply.send({
        message: 'OK',
        filename: data?.filename,
      });
    },
  );
}) as FastifyPluginAsyncTypebox;
