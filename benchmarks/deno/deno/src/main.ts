Deno.serve(
  {
    hostname: '0.0.0.0',
    port: 3000,
    onListen({ hostname, port }) {
      console.log(`Server listening at http://${hostname}:${port}`);
    },
  },
  (request) => {
    const path = new URL(request.url).pathname;

    if (path === '/api/hello-world') {
      return Response.json({ message: 'Hello, World!' });
    }

    return new Response('Not Found', { status: 404 });
  },
);
