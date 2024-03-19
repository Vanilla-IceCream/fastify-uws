# fastify-uws

A performant HTTP and WebSocket server for Fastify with [uWebSockets](https://github.com/uNetworking/uWebSockets.js).

## Installation

Install `fastify-uws` with your favorite package manager:

```sh
$ npm i fastify-uws
# or
$ yarn add fastify-uws
# or
$ pnpm i fastify-uws
# or
$ bun add fastify-uws
```

## Usage

```ts
// app.ts
import fastify from 'fastify';
import { serverFactory } from 'fastify-uws';

import router from '~/plugins/router';

export default () => {
  const app = fastify({
    logger: {
      transport: {
        target: '@fastify/one-line-logger',
      },
    },
    serverFactory,
  });

  app.register(router);

  return app;
};
```

```ts
// server.ts
import app from './app';

const server = app();

const start = async () => {
  try {
    await server.listen({
      host: '127.0.0.1',
      port: 3000,
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
```

### Use [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

```ts
// src/routes/hello-http/+handler.ts
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

export default (async (app) => {
  app.get(
    '',
    {
      schema: {
        response: {
          200: Type.Object({
            message: Type.String(),
          }),
        },
      },
    },
    async (req, reply) => {
      return reply.send({
        message: 'Hello, World!',
      });
    },
  );
}) as FastifyPluginAsyncTypebox;
```

#### With [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

```ts
// app.ts
import multipart from '@fastify/multipart';

app.register(multipart);
```

```ts
// src/routes/hello-fd/+handler.ts
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

export default (async (app) => {
  app.post('', async (req, reply) => {
    const data = await req.file();

    data.file; // stream
    data.fields; // other parsed parts
    data.fieldname;
    data.filename;
    data.encoding;
    data.mimetype;

    // await data.toBuffer(); // Buffer

    return reply.send({ message: 'ok' });
  });
}) as FastifyPluginAsyncTypebox;
```

### Use [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

```ts
// app.ts
import { websocket } from 'fastify-uws';

app.register(websocket);
```

```ts
// src/routes/hello-ws/+handler.ts
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

export default (async (app) => {
  app.get('', { websocket: true }, (con) => {
    app.log.info('Client connected');

    con.socket.on('message', (message: MessageEvent) => {
      console.log(`Client message: ${message}`);
      con.socket.send('Hello from Fastify!');
    });

    con.socket.on('close', () => {
      app.log.info('Client disconnected');
    });
  });
}) as FastifyPluginAsyncTypebox;
```

### Use [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)

```ts
// app.ts
import { eventsource } from 'fastify-uws';

app.register(eventsource);
```

```ts
// src/routes/hello-sse/+handler.ts
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

export default (async (app) => {
  app.get('', (req, reply) => {
    let index = 0;

    reply.sse({ id: String(index), data: `Some message ${index}` });

    const interval = setInterval(() => {
      index += 1;

      reply.sse({ id: String(index), data: `Some message ${index}` });

      if (index === 10) {
        clearInterval(interval);
      }
    }, 1000);

    req.raw.on('close', () => {
      clearInterval(interval);
      app.log.info('Client disconnected');
      reply.sse({ event: 'close' });
    });
  });
}) as FastifyPluginAsyncTypebox;
```

## Benchmarks

### [oha v1.4.1](https://github.com/hatoo/oha)

```sh
$ oha -c 100 -z 30s http://127.0.0.1:3000/api/hello-world
```

|               |       Version | Language        | Router | Requests/sec |
| :------------ | ------------: | :-------------- | -----: | -----------: |
| uws           |       20.42.0 | JavaScript/Node |      ✓ |  193,818.198 |
| elysia        |         1.0.4 | TypeScript/Bun  |      ✓ |   170,423.72 |
| bun           |        1.0.30 | TypeScript/Bun  |      ✗ |  159,498.621 |
| hyper-express |       6.14.12 | JavaScript/Node |      ✓ |  145,027.133 |
| hono          |         4.1.0 | TypeScript/Deno |      ✓ |  127,961.687 |
| hono          |         4.1.0 | TypeScript/Bun  |      ✓ |  127,473.884 |
| deno          |        1.41.3 | TypeScript/Deno |      ✗ |  126,617.695 |
| fastify-uws   |         0.6.1 | JavaScript/Node |      ✓ |  107,552.168 |
| drash         |  3.0.0-beta.2 | TypeScript/Deno |      ✓ |  105,795.397 |
| warp          |         0.3.6 | Rust            |      ✓ |   100,703.95 |
| viz           |         0.8.3 | Rust            |      ✓ |   89,814.772 |
| actix-web     |         4.5.1 | Rust            |      ✓ |   83,220.197 |
| polka         | 1.0.0-next.25 | JavaScript/Node |      ✓ |   82,421.456 |
| salvo         |        0.66.2 | Rust            |      ✓ |   82,377.801 |
| node          |       20.11.1 | JavaScript/Node |      ✗ |   79,993.662 |
| h3            |        1.11.1 | TypeScript/Bun  |      ✓ |   79,860.051 |
| poem          |         2.0.1 | Rust            |      ✓ |   75,890.596 |
| graphul       |         1.0.1 | Rust            |      ✓ |   75,836.835 |
| h3            |        1.11.1 | JavaScript/Node |      ✓ |    72,336.22 |
| oak           |        14.2.0 | TypeScript/Deno |      ✓ |   71,650.312 |
| fastify       |        4.26.2 | JavaScript/Node |      ✓ |   71,211.493 |
| axum          |         0.7.4 | Rust            |      ✓ |    69,168.68 |
| hono          |         4.1.0 | JavaScript/Node |      ✓ |   64,784.203 |
| oak           |        14.2.0 | TypeScript/Bun  |      ✓ |   64,782.043 |
| h3            |        1.11.1 | TypeScript/Deno |      ✓ |   52,208.285 |
| oak           |        14.2.0 | JavaScript/Node |      ✓ |   22,472.041 |
| rocket        |         0.5.0 | Rust            |      ✓ |   12,523.604 |
