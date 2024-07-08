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

### [oha v1.4.5](https://github.com/hatoo/oha)

```sh
$ oha -c 500 -z 10s --no-tui http://0.0.0.0:3000/api/hello-world
```

|               |       Version | Language        | Router | Requests/sec |
| :------------ | ------------: | :-------------- | -----: | -----------: |
| hyper         |         1.4.0 | Rust            |      ✗ |  57,366.5631 |
| viz           |         0.8.8 | Rust            |      ✓ |  56,510.0594 |
| graphul       |         1.0.1 | Rust            |      ✓ |  55,768.6067 |
| axum          |         0.7.5 | Rust            |      ✓ |  55,546.6190 |
| warp          |         0.3.7 | Rust            |      ✓ |  55,267.0771 |
| salvo         |        0.68.4 | Rust            |      ✓ |  54,105.4688 |
| poem          |         3.0.1 | Rust            |      ✓ |  54,087.2176 |
| uws           |       20.44.0 | JavaScript/Node |      ✗ |  53,638.9828 |
| bun           |        1.1.18 | TypeScript/Bun  |      ✗ |  51,638.3431 |
| elysia        |        1.0.27 | TypeScript/Bun  |      ✓ |  51,618.0984 |
| rocket        |         0.5.1 | Rust            |      ✓ |  50,922.3580 |
| actix-web     |         4.8.0 | Rust            |      ✓ |  49,144.0059 |
| hyper-express |        6.16.4 | JavaScript/Node |      ✓ |  46,313.6075 |
| hono          |        4.4.12 | TypeScript/Bun  |      ✓ |  45,683.4532 |
| deno          |        1.44.4 | TypeScript/Deno |      ✗ |  44,326.3138 |
| hono          |        4.4.12 | TypeScript/Deno |      ✓ |  42,165.3493 |
| drash         |  3.0.0-beta.2 | TypeScript/Deno |      ✓ |  39,538.8523 |
| fastify-uws   |         0.7.1 | JavaScript/Node |      ✓ |  35,598.9684 |
| h3            |        1.12.0 | TypeScript/Bun  |      ✓ |  34,250.6413 |
| oak           |        16.1.0 | TypeScript/Deno |      ✓ |  31,522.7018 |
| h3            |        1.12.0 | JavaScript/Node |      ✓ |  28,851.6192 |
| node          |       20.15.0 | JavaScript/Node |      ✗ |  28,381.0677 |
| oak           |        16.1.0 | TypeScript/Bun  |      ✓ |  27,641.5524 |
| fastify       |        4.28.1 | JavaScript/Node |      ✓ |  26,418.8981 |
| polka         | 1.0.0-next.25 | JavaScript/Node |      ✓ |  18,692.5035 |
| hono          |        4.4.12 | JavaScript/Node |      ✓ |  16,228.9869 |
