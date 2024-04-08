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
  app.get('', { websocket: true }, (socket, request) => {
    app.log.info('Client connected');

    socket.on('message', (message: MessageEvent) => {
      console.log(`Client message: ${message}`);
      socket.send('Hello from Fastify!');
    });

    socket.on('close', () => {
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
$ oha -c 500 -z 10s --no-tui http://0.0.0.0:3000/api/hello-world
```

|               |       Version | Language        | Router | Requests/sec |
| :------------ | ------------: | :-------------- | -----: | -----------: |
| uws           |       20.42.0 | JavaScript/Node |      ✗ |  57,727.0730 |
| warp          |         0.3.6 | Rust            |      ✓ |  56,228.3078 |
| axum          |         0.7.4 | Rust            |      ✓ |  56,095.1902 |
| salvo         |        0.66.2 | Rust            |      ✓ |  55,666.1491 |
| viz           |         0.8.3 | Rust            |      ✓ |  55,629.4275 |
| graphul       |         1.0.1 | Rust            |      ✓ |  55,474.0327 |
| poem          |         2.0.1 | Rust            |      ✓ |  55,191.3223 |
| bun           |        1.0.33 | TypeScript/Bun  |      ✗ |  52,423.1544 |
| actix-web     |         4.5.1 | Rust            |      ✓ |  51,230.6647 |
| rocket        |         0.5.0 | Rust            |      ✓ |  50,945.3508 |
| elysia        |         1.0.7 | TypeScript/Bun  |      ✓ |  49,670.6074 |
| deno          |        1.41.3 | TypeScript/Deno |      ✗ |  44,855.9147 |
| hyper-express |       6.14.12 | JavaScript/Node |      ✓ |  44,597.6609 |
| hono          |         4.1.0 | TypeScript/Deno |      ✓ |  44,113.4416 |
| hono          |         4.1.3 | TypeScript/Bun  |      ✓ |  41,575.7729 |
| drash         |  3.0.0-beta.2 | TypeScript/Deno |      ✓ |  40,702.2666 |
| fastify-uws   |         0.7.0 | JavaScript/Node |      ✓ |  38,218.5818 |
| h3            |        1.11.1 | TypeScript/Deno |      ✓ |  35,467.5236 |
| h3            |        1.11.1 | TypeScript/Bun  |      ✓ |  33,565.0918 |
| h3            |        1.11.1 | JavaScript/Node |      ✓ |  30,926.7079 |
| polka         | 1.0.0-next.25 | JavaScript/Node |      ✓ |  30,654.9307 |
| node          |       20.11.1 | JavaScript/Node |      ✗ |  29,198.4867 |
| fastify       |        4.26.2 | JavaScript/Node |      ✓ |  27,116.1111 |
| oak           |        14.2.0 | TypeScript/Deno |      ✓ |  26,576.1720 |
| hono          |         4.1.0 | JavaScript/Node |      ✓ |  25,496.6485 |
| oak           |        14.2.0 | TypeScript/Bun  |      ✓ |  24,004.6213 |
