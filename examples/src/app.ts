import fastify from 'fastify';
import { serverFactory, websocket, eventsource } from 'fastify-uws';

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

  app.register(router);

  return app;
};
