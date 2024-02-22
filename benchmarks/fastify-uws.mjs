import fastify from 'fastify';
import { serverFactory } from 'fastify-uws';

const server = fastify({ serverFactory });

server.get('/', async (request, reply) => {
  return reply.send({ message: 'Hello, World!' });
});

server.listen({ host: '127.0.0.1', port: 3000 }, (err, address) => {
  console.log(`Server listening at ${address}`);
});

// $ node fastify-uws.mjs
