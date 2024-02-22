import fastify from 'fastify';

const server = fastify();

server.get('/', async (request, reply) => {
  return reply.send({ message: 'Hello, World!' });
});

server.listen({ host: '127.0.0.1', port: 3000 }, (err, address) => {
  console.log(`Server listening at ${address}`);
});

// $ node fastify.mjs
// $ deno run --allow-net --allow-sys fastify.mjs
// $ bun fastify.mjs
