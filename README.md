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
    console.log('Client connected');

    con.socket.send('Hello from Fastify uWS!');

    con.socket.on('message', (message) => {
      console.log(`Client message: ${message.toString()}`);
    });

    con.socket.on('close', () => {
      console.log('Client disconnected');
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
  });
}) as FastifyPluginAsyncTypebox;
```

## Benchmarks

### [oha v1.4.0](https://github.com/hatoo/oha)

```sh
$ oha -c 100 -z 30s http://127.0.0.1:3000/api/hello-world
```

|               |       Version | Runtime | Language   | Router | Requests/sec |
| :------------ | ------------: | :------ | :--------- | -----: | -----------: |
| uws           |       20.42.0 | Node    | JavaScript |      ✗ | 187,394.6739 |
| elysia        |        0.8.17 | Bun     | TypeScript |      ✓ | 145,652.9786 |
| bun           |        1.0.30 | Bun     | TypeScript |      ✗ | 141,804.4331 |
| hyper-express |       6.14.12 | Node    | JavaScript |      ✓ | 137,625.2170 |
| hono          |         4.1.0 | Bun     | TypeScript |      ✓ | 117,491.5960 |
| hono          |         4.1.0 | Deno    | TypeScript |      ✓ | 102,834.0527 |
| deno          |        1.41.3 | Deno    | TypeScript |      ✗ | 102,322.8169 |
| fastify-uws   |         0.6.0 | Node    | JavaScript |      ✓ | 101,831.5034 |
| warp          |         0.3.6 | -       | Rust       |      ✓ |  94,908.3410 |
| actix-web     |         4.5.1 | -       | Rust       |      ✓ |  83,531.1064 |
| node          |       20.11.1 | Node    | JavaScript |      ✗ |  75,703.2331 |
| fastify       |        4.26.2 | Node    | JavaScript |      ✓ |  71,417.4915 |
| axum          |         0.7.4 | -       | Rust       |      ✓ |  65,975.6328 |
| hono          |         4.1.0 | Node    | JavaScript |      ✓ |  65,704.3542 |
| h3            |        1.11.1 | Node    | JavaScript |      ✓ |  64,489.0815 |
| h3            |        1.11.1 | Bun     | TypeScript |      ✓ |  62,165.1468 |
| oak           |        14.2.0 | Bun     | TypeScript |      ✓ |  62,526.7515 |
| polka         | 1.0.0-next.25 | Node    | JavaScript |      ✓ |  60,301.0173 |
| oak           |        14.2.0 | Deno    | TypeScript |      ✓ |  59,103.1796 |
| h3            |        1.11.1 | Deno    | TypeScript |      ✓ |  53,684.6082 |
| oak           |        14.2.0 | Node    | JavaScript |      ✓ |  20,199.9936 |
| rocket        |         0.5.0 | -       | Rust       |      ✓ |  12,638.0325 |
