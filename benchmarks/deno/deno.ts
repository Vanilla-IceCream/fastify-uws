Deno.serve(
  {
    hostname: '127.0.0.1',
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

// $ deno run -A deno.ts
// $ curl http://127.0.0.1:3000/api/hello-world
