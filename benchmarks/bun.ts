const server = Bun.serve({
  hostname: '127.0.0.1',
  port: 3000,
  fetch(request) {
    const path = new URL(request.url).pathname;

    if (path === '/api/hello-world') {
      return Response.json({ message: 'Hello, World!' });
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`Server listening at http://${server.hostname}:${server.port}`);

// $ bun bun.ts
// $ curl http://127.0.0.1:3000/api/hello-world
