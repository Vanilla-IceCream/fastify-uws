const server = Bun.serve({
  hostname: '0.0.0.0',
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

process.on('SIGINT', () => {
  process.exit();
});
