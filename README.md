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
| hyper         |         1.4.1 | Rust            |      ✗ |  56,175.6102 |
| warp          |         0.3.7 | Rust            |      ✓ |  55,868.5861 |
| axum          |         0.7.7 | Rust            |      ✓ |  54,588.2828 |
| bun           |        1.1.30 | TypeScript/Bun  |      ✗ |  54,098.4841 |
| graphul       |         1.0.1 | Rust            |      ✓ |  53,949.4400 |
| poem          |         3.1.0 | Rust            |      ✓ |  53,849.0781 |
| uws           |       20.48.0 | JavaScript/Node |      ✗ |  52,802.8029 |
| elysia        |        1.1.17 | TypeScript/Bun  |      ✓ |  52,257.3305 |
|               |               |                 |        |     ~ 5.5k ~ |
| hyper-express |        6.17.2 | JavaScript/Node |      ✓ |  46,745.4887 |
| hono          |         4.6.3 | TypeScript/Bun  |      ✓ |  46,685.6014 |
| nhttp         |         2.0.2 | TypeScript/Deno |      ✓ |  44,874.2535 |
| deno          |         2.0.0 | TypeScript/Deno |      ✗ |  44,753.8552 |
| hono          |         4.6.3 | TypeScript/Deno |      ✓ |  43,280.7544 |
|               |               |                 |        |     ~ 9.2k ~ |
| h3            |        1.12.0 | TypeScript/Bun  |      ✓ |  34,043.4693 |
| fastify-uws   |         1.0.0 | JavaScript/Node |      ✓ |  31,295.8715 |
| polka         | 1.0.0-next.28 | JavaScript/Node |      ✓ |  31,086.5543 |
| oak           |        17.0.0 | TypeScript/Deno |      ✓ |  30,730.7971 |
| node          |       20.18.0 | JavaScript/Node |      ✗ |  29,230.1719 |
| oak           |        17.0.0 | TypeScript/Bun  |      ✓ |  27,449.3417 |
| fastify       |         5.0.0 | JavaScript/Node |      ✓ |  27,408.6679 |
| hono          |         4.6.3 | JavaScript/Node |      ✓ |  25,138.5659 |
|               |               |                 |        |     ~ 4.9k ~ |
| h3            |        1.12.0 | JavaScript/Node |      ✓ |  20,193.2311 |
|               |               |                 |        |     ~ 9.2k ~ |
| express       |        4.21.0 | JavaScript/Node |      ✓ |  10,949.1532 |
