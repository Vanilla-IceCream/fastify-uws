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
$ oha -c 100 -z 30s http://127.0.0.1:3000/api/hello-world
```

|               |       Version | Language        | Router | Requests/sec |
| :------------ | ------------: | :-------------- | -----: | -----------: |
| uws           |       20.42.0 | JavaScript/Node |      ✗ | 200,797.9350 |
| elysia        |         1.0.4 | TypeScript/Bun  |      ✓ | 170,755.3216 |
| bun           |        1.0.30 | TypeScript/Bun  |      ✗ | 154,725.0104 |
| hyper-express |       6.14.12 | JavaScript/Node |      ✓ | 147,600.9193 |
| hono          |         4.1.0 | TypeScript/Deno |      ✓ | 124,786.8319 |
| deno          |        1.41.3 | TypeScript/Deno |      ✗ | 122,319.0593 |
| hono          |         4.1.0 | TypeScript/Bun  |      ✓ | 119,784.5093 |
| fastify-uws   |         0.6.1 | JavaScript/Node |      ✓ | 105,076.1936 |
| drash         |  3.0.0-beta.2 | TypeScript/Deno |      ✓ | 100,883.0311 |
| warp          |         0.3.6 | Rust            |      ✓ |  99,096.8745 |
| actix-web     |         4.5.1 | Rust            |      ✓ |  88,356.5376 |
| viz           |         0.8.3 | Rust            |      ✓ |  87,357.9864 |
| polka         | 1.0.0-next.25 | JavaScript/Node |      ✓ |  82,817.0236 |
| h3            |        1.11.1 | JavaScript/Node |      ✓ |  82,480.6873 |
| graphul       |         1.0.1 | Rust            |      ✓ |  79,820.8219 |
| salvo         |        0.66.2 | Rust            |      ✓ |  79,299.4030 |
| h3            |        1.11.1 | TypeScript/Bun  |      ✓ |  78,957.7750 |
| node          |       20.11.1 | JavaScript/Node |      ✗ |  78,399.2662 |
| poem          |         2.0.1 | Rust            |      ✓ |  74,894.0239 |
| fastify       |        4.26.2 | JavaScript/Node |      ✓ |  73,058.9349 |
| oak           |        14.2.0 | TypeScript/Deno |      ✓ |  68,297.2301 |
| axum          |         0.7.4 | Rust            |      ✓ |  67,922.0531 |
| hono          |         4.1.0 | JavaScript/Node |      ✓ |  64,958.3434 |
| oak           |        14.2.0 | TypeScript/Bun  |      ✓ |  62,591.3209 |
| h3            |        1.11.1 | TypeScript/Deno |      ✓ |  57,512.6910 |
| oak           |        14.2.0 | JavaScript/Node |      ✓ |  21,127.2068 |
| rocket        |         0.5.0 | Rust            |      ✓ |  12,728.0266 |
