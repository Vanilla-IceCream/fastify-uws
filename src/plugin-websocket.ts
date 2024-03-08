import { PassThrough } from 'node:stream';
import { randomBytes } from 'node:crypto';
import fp from 'fastify-plugin';
import Duplexify from 'duplexify';

import { WebSocketServer, WebSocket } from './websocket-server';
import { kWs, kRes } from './symbols';

function defaultErrorHandler(err, request) {
  request.log.error(err);
  request.raw.destroy(err);
}

function fastifyUws(fastify, opts = {}, next) {
  const { server } = fastify;
  const { errorHandler = defaultErrorHandler, options } = opts;

  if (errorHandler && typeof errorHandler !== 'function') {
    return next(new Error('invalid errorHandler function'));
  }

  const websocketServer = (server[kWs] = new WebSocketServer(options));

  fastify.decorate('websocketServer', websocketServer);

  // async function injectWS(path = '/', upgradeContext = {}) {
  //   const server2Client = new PassThrough();
  //   const client2Server = new PassThrough();

  //   const serverStream = new Duplexify(server2Client, client2Server);
  //   const clientStream = new Duplexify(client2Server, server2Client);

  //   const ws = new WebSocket(null, undefined, { isServer: false });
  //   const head = Buffer.from([]);

  //   let resolve, reject;
  //   const promise = new Promise((_resolve, _reject) => {
  //     resolve = _resolve;
  //     reject = _reject;
  //   });

  //   ws.on('open', () => {
  //     clientStream.removeListener('data', onData);
  //     resolve(ws);
  //   });

  //   const onData = (chunk) => {
  //     if (chunk.toString().includes('HTTP/1.1 101 Switching Protocols')) {
  //       ws._isServer = false;
  //       ws.setSocket(clientStream, head, { maxPayload: 0 });
  //     } else {
  //       clientStream.removeListener('data', onData);
  //       const statusCode = Number(chunk.toString().match(/HTTP\/1.1 (\d+)/)[1]);
  //       reject(new Error('Unexpected server response: ' + statusCode));
  //     }
  //   };

  //   clientStream.on('data', onData);

  //   const req = {
  //     ...upgradeContext,
  //     method: 'GET',
  //     headers: {
  //       ...upgradeContext.headers,
  //       connection: 'upgrade',
  //       upgrade: 'websocket',
  //       'sec-websocket-version': 13,
  //       'sec-websocket-key': randomBytes(16).toString('base64'),
  //     },
  //     httpVersion: '1.1',
  //     url: path,
  //     [kWs]: serverStream,
  //     [kWsHead]: head,
  //   };

  //   websocketListenServer.emit('upgrade', req, req[kWs], req[kWsHead]);

  //   return promise;
  // }

  // fastify.decorate('injectWS', injectWS);

  fastify.addHook('onRoute', (routeOptions) => {
    const isWebSocket = !!routeOptions.websocket;
    if (!isWebSocket || routeOptions.method === 'HEAD' || routeOptions.method === 'OPTIONS') return;

    const wsOptions = typeof routeOptions.ws === 'object' ? routeOptions.ws : {};
    const handler = routeOptions.handler;
    const namespace = Buffer.from(routeOptions.url);

    const topics = {};
    if (wsOptions.topics) {
      wsOptions.topics.forEach((topic) => {
        topics[topic] = WebSocket.allocTopic(namespace, topic);
      });
    }

    routeOptions.handler = function (request, reply) {
      const requestRaw = request.raw;
      if (requestRaw[kWs]) {
        reply.hijack();
        const uRes = requestRaw.socket[kRes];
        requestRaw.socket[kWs] = true;
        if (requestRaw.socket.aborted || requestRaw.socket.destroyed) return;
        uRes.upgrade(
          {
            req: requestRaw,
            handler: (ws) => {
              const conn = new WebSocket(namespace, ws, topics);

              let result;
              try {
                request.log.info('fastify-uws: websocket connection opened');
                conn.once('close', () => {
                  request.log.info('fastify-uws: websocket connection closed');
                });

                requestRaw.once('error', () => {
                  conn.close();
                });

                requestRaw.once('close', () => {
                  conn.end();
                });

                result = handler.call(this, { socket: conn }, request, reply);
              } catch (err) {
                return errorHandler.call(this, err, { socket: conn }, request, reply);
              }

              if (result && typeof result.catch === 'function') {
                result.catch((err) =>
                  errorHandler.call(this, err, { socket: conn }, request, reply),
                );
              }
            },
          },
          requestRaw.headers['sec-websocket-key'],
          requestRaw.headers['sec-websocket-protocol'],
          requestRaw.headers['sec-websocket-extensions'],
          requestRaw[kWs],
        );
      } else {
        return handler.call(this, request, reply);
      }
    };
  });

  next();
}

export default fp(fastifyUws, {
  fastify: '4.x',
  name: '@fastify/websocket',
});
