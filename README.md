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
| viz           |         0.8.3 | Rust            |      ✓ |  54,425.9261 |
| warp          |         0.3.6 | Rust            |      ✓ |  53,671.8492 |
| graphul       |         1.0.1 | Rust            |      ✓ |  53,191.2526 |
| uws           |       20.43.0 | JavaScript/Node |      ✗ |  52,876.5781 |
| axum          |         0.7.4 | Rust            |      ✓ |  51,859.1351 |
| salvo         |        0.66.2 | Rust            |      ✓ |  50,160.3650 |
| elysia        |        1.0.13 | TypeScript/Bun  |      ✓ |  49,922.5965 |
| poem          |         2.0.1 | Rust            |      ✓ |  49,864.7481 |
| actix-web     |         4.5.1 | Rust            |      ✓ |  49,656.0993 |
| bun           |         1.1.1 | TypeScript/Bun  |      ✗ |  48,908.4287 |
| rocket        |         0.5.0 | Rust            |      ✓ |  46,504.3755 |
| hyper-express |        6.15.1 | JavaScript/Node |      ✓ |  45,234.9526 |
| hono          |         4.2.2 | TypeScript/Deno |      ✓ |  44,007.7268 |
| deno          |        1.42.1 | TypeScript/Deno |      ✗ |  43,234.8553 |
| hono          |         4.2.2 | TypeScript/Bun  |      ✓ |  37,743.8875 |
| fastify-uws   |         0.7.0 | JavaScript/Node |      ✓ |  35,818.1528 |
| h3            |        1.11.1 | TypeScript/Deno |      ✓ |  35,765.5217 |
| h3            |        1.11.1 | TypeScript/Bun  |      ✓ |  31,687.5791 |
| drash         |  3.0.0-beta.2 | TypeScript/Deno |      ✓ |  31,235.6363 |
| polka         | 1.0.0-next.25 | JavaScript/Node |      ✓ |  30,230.3721 |
| oak           |        14.2.0 | TypeScript/Deno |      ✓ |  29,849.7069 |
| h3            |        1.11.1 | JavaScript/Node |      ✓ |  29,636.2344 |
| oak           |        14.2.0 | TypeScript/Bun  |      ✓ |  26,865.1734 |
| fastify       |        4.26.2 | JavaScript/Node |      ✓ |  23,783.6170 |
| node          |       20.12.1 | JavaScript/Node |      ✗ |  23,681.5751 |
| hono          |         4.2.2 | JavaScript/Node |      ✓ |  22,424.7811 |

#### Round 2

|               |       Version | Language        | Router | Requests/sec |
| :------------ | ------------: | :-------------- | -----: | -----------: |
| uws           |       20.43.0 | JavaScript/Node |      ✗ |  55,741.5805 |
| poem          |         2.0.1 | Rust            |      ✓ |  54,590.8890 |
| warp          |         0.3.6 | Rust            |      ✓ |  54,278.9534 |
| axum          |         0.7.4 | Rust            |      ✓ |  54,275.1053 |
| salvo         |        0.66.2 | Rust            |      ✓ |  54,238.4987 |
| viz           |         0.8.3 | Rust            |      ✓ |  54,213.3563 |
| graphul       |         1.0.1 | Rust            |      ✓ |  53,329.6437 |
| actix-web     |         4.5.1 | Rust            |      ✓ |  50,163.2742 |
| rocket        |         0.5.0 | Rust            |      ✓ |  49,816.6145 |
| elysia        |        1.0.13 | TypeScript/Bun  |      ✓ |  46,678.1258 |
| hono          |         4.2.2 | TypeScript/Bun  |      ✓ |  44,413.5211 |
| deno          |        1.42.1 | TypeScript/Deno |      ✗ |  44,406.3013 |
| hono          |         4.2.2 | TypeScript/Deno |      ✓ |  44,352.9821 |
| bun           |         1.1.1 | TypeScript/Bun  |      ✗ |  44,129.4139 |
| hyper-express |        6.15.1 | JavaScript/Node |      ✓ |  43,897.9176 |
| drash         |  3.0.0-beta.2 | TypeScript/Deno |      ✓ |  39,267.1312 |
| fastify-uws   |         0.7.0 | JavaScript/Node |      ✓ |  36,511.2087 |
| h3            |        1.11.1 | TypeScript/Bun  |      ✓ |  35,874.8801 |
| h3            |        1.11.1 | TypeScript/Deno |      ✓ |  32,962.1841 |
| oak           |        14.2.0 | TypeScript/Deno |      ✓ |  32,289.5578 |
| polka         | 1.0.0-next.25 | JavaScript/Node |      ✓ |  31,112.7917 |
| node          |       20.12.1 | JavaScript/Node |      ✗ |  29,076.1339 |
| fastify       |        4.26.2 | JavaScript/Node |      ✓ |  27,316.1500 |
| h3            |        1.11.1 | JavaScript/Node |      ✓ |  27,072.4943 |
| hono          |         4.2.2 | JavaScript/Node |      ✓ |  24,885.4137 |
| oak           |        14.2.0 | TypeScript/Bun  |      ✓ |  23,031.8545 |

#### Round 3

|               |       Version | Language        | Router | Requests/sec |
| :------------ | ------------: | :-------------- | -----: | -----------: |
| warp          |         0.3.6 | Rust            |      ✓ |  56,830.0234 |
| viz           |         0.8.3 | Rust            |      ✓ |  54,509.8893 |
| graphul       |         1.0.1 | Rust            |      ✓ |  54,155.8700 |
| axum          |         0.7.4 | Rust            |      ✓ |  53,361.0436 |
| uws           |       20.43.0 | JavaScript/Node |      ✗ |  53,359.0283 |
| poem          |         2.0.1 | Rust            |      ✓ |  53,330.5887 |
| salvo         |        0.66.2 | Rust            |      ✓ |  53,250.2251 |
| elysia        |        1.0.13 | TypeScript/Bun  |      ✓ |  51,446.4040 |
| rocket        |         0.5.0 | Rust            |      ✓ |  50,199.9382 |
| actix-web     |         4.5.1 | Rust            |      ✓ |  50,119.3803 |
| hyper-express |        6.15.1 | JavaScript/Node |      ✓ |  46,781.2486 |
| bun           |         1.1.1 | TypeScript/Bun  |      ✗ |  46,114.3088 |
| hono          |         4.2.2 | TypeScript/Deno |      ✓ |  45,900.6343 |
| deno          |        1.42.1 | TypeScript/Deno |      ✗ |  45,268.5221 |
| hono          |         4.2.2 | TypeScript/Bun  |      ✓ |  41,914.8240 |
| fastify-uws   |         0.7.0 | JavaScript/Node |      ✓ |  34,170.5868 |
| drash         |  3.0.0-beta.2 | TypeScript/Deno |      ✓ |  33,697.9263 |
| h3            |        1.11.1 | TypeScript/Bun  |      ✓ |  32,759.3224 |
| oak           |        14.2.0 | TypeScript/Deno |      ✓ |  31,751.0562 |
| polka         | 1.0.0-next.25 | JavaScript/Node |      ✓ |  30,135.1056 |
| node          |       20.12.1 | JavaScript/Node |      ✗ |  29,658.7086 |
| h3            |        1.11.1 | JavaScript/Node |      ✓ |  29,248.9563 |
| oak           |        14.2.0 | TypeScript/Bun  |      ✓ |  27,174.2978 |
| hono          |         4.2.2 | JavaScript/Node |      ✓ |  24,983.4641 |
| fastify       |        4.26.2 | JavaScript/Node |      ✓ |  24,501.4054 |
| h3            |        1.11.1 | TypeScript/Deno |      ✓ |  23,544.9800 |
