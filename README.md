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
| uws           |       20.42.0 | JavaScript/Node |      ✗ | 201,254.7673 |
| elysia        |         1.0.7 | TypeScript/Bun  |      ✓ | 165,658.9940 |
| bun           |        1.0.33 | TypeScript/Bun  |      ✗ | 157,740.9324 |
| hyper-express |       6.14.12 | JavaScript/Node |      ✓ | 147,203.6417 |
| hono          |         4.1.0 | TypeScript/Deno |      ✓ | 127,641.2455 |
| hono          |         4.1.3 | TypeScript/Bun  |      ✓ | 127,078.3155 |
| deno          |        1.41.3 | TypeScript/Deno |      ✗ | 124,009.3235 |
| fastify-uws   |         0.7.0 | JavaScript/Node |      ✓ | 106,703.9337 |
| drash         |  3.0.0-beta.2 | TypeScript/Deno |      ✓ | 103,259.7520 |
| warp          |         0.3.6 | Rust            |      ✓ | 100,484.9302 |
| actix-web     |         4.5.1 | Rust            |      ✓ |  90,732.3540 |
| viz           |         0.8.3 | Rust            |      ✓ |  89,495.6050 |
| polka         | 1.0.0-next.25 | JavaScript/Node |      ✓ |  85,310.5995 |
| h3            |        1.11.1 | JavaScript/Node |      ✓ |  83,828.1583 |
| salvo         |        0.66.2 | Rust            |      ✓ |  82,421.8434 |
| graphul       |         1.0.1 | Rust            |      ✓ |  82,264.9004 |
| node          |       20.11.1 | JavaScript/Node |      ✗ |  78,002.1550 |
| poem          |         2.0.1 | Rust            |      ✓ |  76,619.3898 |
| fastify       |        4.26.2 | JavaScript/Node |      ✓ |  74,081.3050 |
| h3            |        1.11.1 | TypeScript/Bun  |      ✓ |  71,586.5510 |
| axum          |         0.7.4 | Rust            |      ✓ |  71,067.2212 |
| oak           |        14.2.0 | TypeScript/Deno |      ✓ |  70,369.1091 |
| hono          |         4.1.0 | JavaScript/Node |      ✓ |  65,008.0376 |
| oak           |        14.2.0 | TypeScript/Bun  |      ✓ |  61,184.7571 |
| h3            |        1.11.1 | TypeScript/Deno |      ✓ |  55,249.2163 |
| oak           |        14.2.0 | JavaScript/Node |      ✓ |  22,015.9263 |
| rocket        |         0.5.0 | Rust            |      ✓ |  12,600.3534 |
