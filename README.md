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

### [autocannon](https://github.com/mcollina/autocannon)

```sh
$ autocannon -c 100 -p 10 -d 40 http://127.0.0.1:3000
```

|                 |   Version |  Req/Sec (Avg) |
| :-------------- | --------: | -------------: |
| bun             |    1.0.28 |     270,155.20 |
| deno            |    1.41.0 |     266,790.41 |
| uws             |   20.42.0 |     254,153.60 |
| **fastify-uws** | **0.5.0** | **242,409.60** |
| fastify (bun)   |    4.26.1 |     145,919.00 |
| node            |   20.11.1 |     142,995.21 |
| fastify         |    4.26.1 |     128,088.00 |
| fastify (deno)  |    4.26.1 |      94,574.40 |

### [oha](https://github.com/hatoo/oha)

```sh
$ oha -c 100 -n 10 -z 40s http://127.0.0.1:3000
```

|                 |   Version |    Requests/sec |
| :-------------- | --------: | --------------: |
| uws             |   20.42.0 |    178,313.1145 |
| bun             |    1.0.28 |    167,834.1241 |
| deno            |    1.41.0 |    126,947.8286 |
| **fastify-uws** | **0.5.0** | **93,220.2602** |
| node            |   20.11.1 |     75,221.4017 |
| fastify (bun)   |    4.26.1 |     73,008.0009 |
| fastify         |    4.26.1 |     68,916.1586 |
| fastify (deno)  |    4.26.1 |     61,638.9279 |

### [bombardier](https://github.com/codesenberg/bombardier)

```sh
$ bombardier http://127.0.0.1:3000
```

|                 |   Version |       Reqs/sec |
| :-------------- | --------: | -------------: |
| uws             |   20.42.0 |     198,435.48 |
| bun             |    1.0.28 |     198,203.21 |
| deno            |    1.41.0 |     135,906.07 |
| **fastify-uws** | **0.5.0** | **110,698.53** |
| node            |   20.11.1 |      85,637.71 |
| fastify (bun)   |    4.26.1 |      85,075.90 |
| fastify         |    4.26.1 |      78,194.26 |
| fastify (deno)  |    4.26.1 |      68,026.92 |
