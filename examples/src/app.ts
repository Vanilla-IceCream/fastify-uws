import multipart from '@fastify/multipart';
import fastify from 'fastify';
import { eventsource, serverFactory, websocket } from 'fastify-uws';

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
  app.register(eventsource);
  app.register(multipart);

  app.register(router);

  return app;
};
