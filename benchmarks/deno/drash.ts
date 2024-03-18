import { Chain, Resource } from 'drash';

class HelloWorld extends Resource {
  paths = ['/hello-world'];

  GET() {
    return Response.json({ message: 'Hello, World!' });
  }
}

const router = Resource.group().resources(HelloWorld).pathPrefixes('/api').build();

const chain = Chain.builder().resources(router).build();

Deno.serve({
  hostname: '127.0.0.1',
  port: 3000,
  onListen({ hostname, port }) {
    console.log(`Server listening at http://${hostname}:${port}`);
  },
  async handler(request: Request): Promise<Response> {
    return chain.handle<Response>(request).catch((err: Error) => {
      return new Response(err.message, { status: 500 });
    });
  },
});

// $ deno run -A drash.ts
// $ curl http://127.0.0.1:3000/api/hello-world
