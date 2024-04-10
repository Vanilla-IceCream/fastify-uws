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

#### Round 1

|               |       Version | Language        | Router | Requests/sec |
| :------------ | ------------: | :-------------- | -----: | -----------: |
| hyper         |         1.2.0 | Rust            |      ✗ |  56,262.8828 |
| warp          |         0.3.6 | Rust            |      ✓ |  55,413.2098 |
| uws           |       20.43.0 | JavaScript/Node |      ✗ |  54,936.6504 |
| viz           |         0.8.3 | Rust            |      ✓ |  54,544.0379 |
| axum          |         0.7.4 | Rust            |      ✓ |  54,366.0321 |
| poem          |         2.0.1 | Rust            |      ✓ |  54,139.7879 |
| graphul       |         1.0.1 | Rust            |      ✓ |  53,958.5545 |
| salvo         |        0.66.2 | Rust            |      ✓ |  53,562.5958 |
| bun           |         1.1.1 | TypeScript/Bun  |      ✗ |  53,249.7334 |
| rocket        |         0.5.0 | Rust            |      ✓ |  51,447.6432 |
| elysia        |        1.0.13 | TypeScript/Bun  |      ✓ |  51,272.3293 |
| actix-web     |         4.5.1 | Rust            |      ✓ |  49,768.7938 |
| hono          |         4.2.2 | TypeScript/Bun  |      ✓ |  45,713.3907 |
| hyper-express |        6.15.1 | JavaScript/Node |      ✓ |  45,570.4958 |
| hono          |         4.2.2 | TypeScript/Deno |      ✓ |  44,769.4540 |
| deno          |        1.42.1 | TypeScript/Deno |      ✗ |  44,662.8648 |
| drash         |  3.0.0-beta.2 | TypeScript/Deno |      ✓ |  41,604.3191 |
| fastify-uws   |         0.7.0 | JavaScript/Node |      ✓ |  37,991.9966 |
| h3            |        1.11.1 | TypeScript/Deno |      ✓ |  35,210.1163 |
| h3            |        1.11.1 | TypeScript/Bun  |      ✓ |  32,071.3073 |
| oak           |        14.2.0 | TypeScript/Deno |      ✓ |  31,410.6134 |
| h3            |        1.11.1 | JavaScript/Node |      ✓ |  30,153.7447 |
| node          |       20.12.1 | JavaScript/Node |      ✗ |  29,388.2349 |
| fastify       |        4.26.2 | JavaScript/Node |      ✓ |  27,589.0118 |
| hono          |         4.2.2 | JavaScript/Node |      ✓ |  25,198.2960 |
| polka         | 1.0.0-next.25 | JavaScript/Node |      ✓ |  22,806.9399 |
| oak           |        14.2.0 | TypeScript/Bun  |      ✓ |  22,151.3947 |

#### Round 2

|               |       Version | Language        | Router | Requests/sec |
| :------------ | ------------: | :-------------- | -----: | -----------: |
| warp          |         0.3.6 | Rust            |      ✓ |  55,053.0475 |
| uws           |       20.43.0 | JavaScript/Node |      ✗ |  54,761.6827 |
| viz           |         0.8.3 | Rust            |      ✓ |  54,401.4776 |
| axum          |         0.7.4 | Rust            |      ✓ |  54,395.5151 |
| graphul       |         1.0.1 | Rust            |      ✓ |  54,156.1952 |
| hyper         |         1.2.0 | Rust            |      ✗ |  54,141.1060 |
| poem          |         2.0.1 | Rust            |      ✓ |  53,955.1222 |
| salvo         |        0.66.2 | Rust            |      ✓ |  53,904.0594 |
| bun           |         1.1.1 | TypeScript/Bun  |      ✗ |  51,817.2410 |
| elysia        |        1.0.13 | TypeScript/Bun  |      ✓ |  51,488.6109 |
| rocket        |         0.5.0 | Rust            |      ✓ |  50,618.1340 |
| actix-web     |         4.5.1 | Rust            |      ✓ |  49,864.0242 |
| hyper-express |        6.15.1 | JavaScript/Node |      ✓ |  46,558.9299 |
| hono          |         4.2.2 | TypeScript/Bun  |      ✓ |  45,054.8384 |
| deno          |        1.42.1 | TypeScript/Deno |      ✗ |  44,804.4318 |
| hono          |         4.2.2 | TypeScript/Deno |      ✓ |  44,786.7461 |
| drash         |  3.0.0-beta.2 | TypeScript/Deno |      ✓ |  40,621.7867 |
| fastify-uws   |         0.7.0 | JavaScript/Node |      ✓ |  38,167.7099 |
| h3            |        1.11.1 | TypeScript/Bun  |      ✓ |  33,891.8063 |
| h3            |        1.11.1 | TypeScript/Deno |      ✓ |  33,736.5124 |
| oak           |        14.2.0 | TypeScript/Deno |      ✓ |  31,224.4031 |
| polka         | 1.0.0-next.25 | JavaScript/Node |      ✓ |  28,623.6484 |
| node          |       20.12.1 | JavaScript/Node |      ✗ |  28,059.7339 |
| h3            |        1.11.1 | JavaScript/Node |      ✓ |  27,522.4966 |
| fastify       |        4.26.2 | JavaScript/Node |      ✓ |  27,028.7908 |
| hono          |         4.2.2 | JavaScript/Node |      ✓ |  25,257.8000 |
| oak           |        14.2.0 | TypeScript/Bun  |      ✓ |  22,796.7969 |

#### Round 3

|               |       Version | Language        | Router | Requests/sec |
| :------------ | ------------: | :-------------- | -----: | -----------: |
| hyper         |         1.2.0 | Rust            |      ✗ |  55,896.3816 |
| viz           |         0.8.3 | Rust            |      ✓ |  55,055.4270 |
| salvo         |        0.66.2 | Rust            |      ✓ |  54,761.9791 |
| warp          |         0.3.6 | Rust            |      ✓ |  54,657.2309 |
| uws           |       20.43.0 | JavaScript/Node |      ✗ |  54,305.0799 |
| graphul       |         1.0.1 | Rust            |      ✓ |  54,139.9006 |
| axum          |         0.7.4 | Rust            |      ✓ |  54,121.9253 |
| poem          |         2.0.1 | Rust            |      ✓ |  53,843.4990 |
| rocket        |         0.5.0 | Rust            |      ✓ |  51,748.7393 |
| actix-web     |         4.5.1 | Rust            |      ✓ |  50,019.9149 |
| elysia        |        1.0.13 | TypeScript/Bun  |      ✓ |  49,460.9121 |
| hyper-express |        6.15.1 | JavaScript/Node |      ✓ |  47,962.9897 |
| hono          |         4.2.2 | TypeScript/Deno |      ✓ |  44,552.3948 |
| deno          |        1.42.1 | TypeScript/Deno |      ✗ |  43,262.0878 |
| bun           |         1.1.1 | TypeScript/Bun  |      ✗ |  42,808.5557 |
| hono          |         4.2.2 | TypeScript/Bun  |      ✓ |  42,694.7743 |
| drash         |  3.0.0-beta.2 | TypeScript/Deno |      ✓ |  41,907.4852 |
| fastify-uws   |         0.7.0 | JavaScript/Node |      ✓ |  35,952.0719 |
| h3            |        1.11.1 | TypeScript/Deno |      ✓ |  34,462.8275 |
| h3            |        1.11.1 | TypeScript/Bun  |      ✓ |  34,348.0887 |
| oak           |        14.2.0 | TypeScript/Deno |      ✓ |  31,447.9778 |
| h3            |        1.11.1 | JavaScript/Node |      ✓ |  31,340.3190 |
| polka         | 1.0.0-next.25 | JavaScript/Node |      ✓ |  29,869.0525 |
| node          |       20.12.1 | JavaScript/Node |      ✗ |  28,047.6443 |
| fastify       |        4.26.2 | JavaScript/Node |      ✓ |  26,931.3162 |
| oak           |        14.2.0 | TypeScript/Bun  |      ✓ |  26,284.5028 |
| hono          |         4.2.2 | JavaScript/Node |      ✓ |  25,364.4139 |
