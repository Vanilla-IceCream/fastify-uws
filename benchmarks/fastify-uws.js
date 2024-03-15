import fastify from 'fastify';
import { serverFactory } from 'fastify-uws';

const server = fastify({ serverFactory });

const router = async (app) => {
  app.get(
    '/hello-world',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: { message: { type: 'string' } },
          },
        },
      },
    },
    async (request, reply) => {
      return reply.send({ message: 'Hello, World!' });
    },
  );
};

server.register(router, { prefix: '/api' });

server.listen({ host: '127.0.0.1', port: 3000 }, (err, address) => {
  console.log(`Server listening at ${address}`);
});

// $ node fastify-uws.js
// $ curl http://127.0.0.1:3000/api/hello-world
