Deno.serve(
  {
    hostname: '127.0.0.1',
    port: 3000,
    onListen({ hostname, port }) {
      console.log(`Server listening at http://${hostname}:${port}`);
    },
  },
  () => {
    return Response.json({ message: 'Hello, World!' });
  },
);

// $ deno run -A deno.ts
