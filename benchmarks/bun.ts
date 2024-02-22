const server = Bun.serve({
  hostname: '127.0.0.1',
  port: 3000,
  fetch() {
    return Response.json({ message: 'Hello, World!' });
  },
});

console.log(`Server listening at http://${server.hostname}:${server.port}`);

// $ bun bun.ts
