import multipart from '@fastify/multipart';
import sse from '@fastify/sse';
import fastify from 'fastify';
import { serverFactory, websocket } from 'fastify-uws';

import router from '~/plugins/router';

export default () => {
  const app = fastify({
    logger: {
      transport: {
        target: '@fastify/one-line-logger',
      },
    },
    serverFactory,
  });

  app.register(websocket);
  app.register(sse);
  app.register(multipart);

  app.register(router);

  return app;
};
