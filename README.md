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
| warp          |         0.3.7 | Rust            |      ✓ |  55,706.0917 |
| viz           |         0.8.8 | Rust            |      ✓ |  55,212.6539 |
| salvo         |        0.68.4 | Rust            |      ✓ |  55,171.2799 |
| graphul       |         1.0.1 | Rust            |      ✓ |  54,426.0467 |
| hyper         |         1.4.0 | Rust            |      ✗ |  54,412.4178 |
| axum          |         0.7.5 | Rust            |      ✓ |  54,373.4738 |
| poem          |         3.0.1 | Rust            |      ✓ |  52,610.6364 |
| uws           |       20.44.0 | JavaScript/Node |      ✗ |  50,979.2791 |
| rocket        |         0.5.1 | Rust            |      ✓ |  50,606.9264 |
| elysia        |        1.0.27 | TypeScript/Bun  |      ✓ |  48,558.5455 |
| actix-web     |         4.8.0 | Rust            |      ✓ |  47,533.2626 |
| bun           |        1.1.18 | TypeScript/Bun  |      ✗ |  47,197.2509 |
| hono          |        4.4.12 | TypeScript/Deno |      ✓ |  45,751.4894 |
| hyper-express |        6.16.4 | JavaScript/Node |      ✓ |  45,713.5774 |
| nhttp         |         2.0.2 | TypeScript/Deno |      ✓ |  44,981.6350 |
| hono          |        4.4.12 | TypeScript/Bun  |      ✓ |  43,572.2954 |
| fastify-uws   |         0.7.1 | JavaScript/Node |      ✓ |  34,054.4867 |
| deno          |        1.44.4 | TypeScript/Deno |      ✗ |  33,190.7563 |
| oak           |        16.1.0 | TypeScript/Deno |      ✓ |  32,086.9585 |
| h3            |        1.12.0 | JavaScript/Node |      ✓ |  31,112.9339 |
| h3            |        1.12.0 | TypeScript/Bun  |      ✓ |  30,564.0733 |
| polka         | 1.0.0-next.25 | JavaScript/Node |      ✓ |  30,235.0700 |
| node          |       20.15.0 | JavaScript/Node |      ✗ |  29,661.1526 |
| fastify       |        4.28.1 | JavaScript/Node |      ✓ |  26,944.1364 |
| oak           |        16.1.0 | TypeScript/Bun  |      ✓ |  26,180.5017 |
| hono          |        4.4.12 | JavaScript/Node |      ✓ |  24,536.4926 |
| express       |        4.19.2 | JavaScript/Node |      ✓ |  10,251.3516 |
