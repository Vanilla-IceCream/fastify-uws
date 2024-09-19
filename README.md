![fastify-uws](./.github/assets/logo.png)

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

## Supported

- `fastify` v5.x
- `@fastify/websocket` v11.x

## Usage

Just two lines are needed to speed up your Fastify application.

```ts
// app.ts
import fastify from 'fastify';
import { serverFactory } from 'fastify-uws'; // Import here

import router from '~/plugins/router';

export default () => {
  const app = fastify({
    logger: {
      transport: {
        target: '@fastify/one-line-logger',
      },
    },
    serverFactory, // And use here
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
import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';

export default (async (app) => {
  app.post('', async (req, reply) => {
    const data = await req.file();

    data.file; // stream
    data.fields; // other parsed parts
    data.fieldname;
    data.filename;
    data.encoding;
    data.mimetype;

    await pipeline(data.file, fs.createWriteStream(data.filename));
    // or
    // await data.toBuffer(); // Buffer

    return reply.send({ message: 'ok' });
  });
}) as FastifyPluginAsyncTypebox;
```

### Use [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

Just a single line of change can speed up your WebSocket application in Fastify.

```diff
- import websocket from '@fastify/websocket';
+ import { websocket } from 'fastify-uws';
```

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
| hyper         |         1.4.0 | Rust            |      ✗ |  54,852.5710 |
| viz           |         0.8.8 | Rust            |      ✓ |  54,767.9522 |
| salvo         |        0.68.4 | Rust            |      ✓ |  54,550.5513 |
| warp          |         0.3.7 | Rust            |      ✓ |  54,412.2379 |
| graphul       |         1.0.1 | Rust            |      ✓ |  53,995.5395 |
| axum          |         0.7.5 | Rust            |      ✓ |  53,730.4898 |
| poem          |         3.0.1 | Rust            |      ✓ |  53,011.8436 |
| uws           |       20.44.0 | JavaScript/Node |      ✗ |  52,569.3922 |
| bun           |        1.1.18 | TypeScript/Bun  |      ✗ |  51,434.7305 |
| rocket        |         0.5.1 | Rust            |      ✓ |  50,213.6357 |
| actix-web     |         4.8.0 | Rust            |      ✓ |  48,072.2446 |
| nhttp         |         2.0.2 | TypeScript/Deno |      ✓ |  47,501.5437 |
| elysia        |        1.0.27 | TypeScript/Bun  |      ✓ |  45,774.7223 |
| hyper-express |        6.16.4 | JavaScript/Node |      ✓ |  44,410.8668 |
| hono          |        4.4.12 | TypeScript/Bun  |      ✓ |  44,272.6046 |
| hono          |        4.4.12 | TypeScript/Deno |      ✓ |  42,049.4956 |
| deno          |        1.44.4 | TypeScript/Deno |      ✗ |  40,959.3045 |
|               |               |                 |        |            ~ |
| h3            |        1.12.0 | TypeScript/Bun  |      ✓ |  33,830.7969 |
| fastify-uws   |         0.8.1 | JavaScript/Node |      ✓ |  32,644.0851 |
| oak           |        16.1.0 | TypeScript/Deno |      ✓ |  31,757.4717 |
| h3            |        1.12.0 | JavaScript/Node |      ✓ |  30,557.6711 |
| polka         | 1.0.0-next.25 | JavaScript/Node |      ✓ |  30,074.4079 |
| node          |       20.15.0 | JavaScript/Node |      ✗ |  28,620.6313 |
| oak           |        16.1.0 | TypeScript/Bun  |      ✓ |  26,580.4056 |
| fastify       |        4.28.1 | JavaScript/Node |      ✓ |  25,896.2251 |
| hono          |        4.4.12 | JavaScript/Node |      ✓ |  23,898.3443 |
|               |               |                 |        |            ~ |
| express       |        4.19.2 | JavaScript/Node |      ✓ |  10,599.2688 |
