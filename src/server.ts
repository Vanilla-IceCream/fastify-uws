import dns from 'node:dns/promises';
import EventEmitter from 'node:events';
import type { FastifyServerFactoryHandler } from 'fastify';
import ipaddr from 'ipaddr.js';
import uws from 'uWebSockets.js';

import { ERR_ADDRINUSE, ERR_ENOTFOUND, ERR_SERVER_DESTROYED, ERR_SOCKET_BAD_PORT } from './errors';
import { HTTPSocket } from './http-socket';
import { Request } from './request';
import { Response } from './response';
import { kAddress, kApp, kClosed, kHandler, kHttps, kListen, kListenAll } from './symbols';
import { kListenSocket, kListening, kWs } from './symbols';
import type { WebSocketServer } from './websocket-server';

function createApp() {
  return uws.App();
}

const mainServer = {};

interface FastifyUwsOptions {
  connectionTimeout?: number;
  https?: boolean;
}

export class Server extends EventEmitter {
  [kHandler]: FastifyServerFactoryHandler;
  timeout?: number;
  [kHttps]?: boolean | Record<string, string>;
  [kWs]?: WebSocketServer | null;
  [kAddress]?: null | any;
  [kListenSocket]?: null | any;
  [kApp]: uws.TemplatedApp;
  [kClosed]?: boolean;
  [kListenAll]?: boolean;
  [kListening]?: boolean;

  constructor(handler: FastifyServerFactoryHandler, opts: FastifyUwsOptions = {}) {
    super();

    const { connectionTimeout = 0, https = false } = opts;

    this[kHandler] = handler;
    this.timeout = connectionTimeout;
    this[kHttps] = https;
    this[kWs] = null;
    this[kAddress] = null;
    this[kListenSocket] = null;
    this[kApp] = createApp();
    this[kClosed] = false;
  }

  get encrypted() {
    return !!this[kHttps];
  }

  get listening() {
    return this[kListening];
  }

  setTimeout(timeout: number) {
    this.timeout = timeout;
  }

  address() {
    return this[kAddress];
  }

  listen(listenOptions: { host: string; port: number; signal: AbortSignal }, cb) {
    if (listenOptions?.signal) {
      listenOptions.signal.addEventListener('abort', () => {
        this.close();
      });
    }

    this[kListen](listenOptions)
      .then(() => {
        cb?.();
        this[kListening] = true;
        this.emit('listening');
      })
      .catch((err) => {
        this[kAddress] = null;
        process.nextTick(() => this.emit('error', err));
      });
  }

  closeIdleConnections() {
    this.close();
  }

  close(cb = () => {}) {
    this[kAddress] = null;
    this[kListening] = false;
    if (this[kClosed]) return cb();
    const port = this[kAddress]?.port;
    if (port !== undefined && mainServer[port] === this) {
      delete mainServer[port];
    }
    this[kAddress] = null;
    this[kClosed] = true;
    if (this[kListenSocket]) {
      uws.us_listen_socket_close(this[kListenSocket]);
      this[kListenSocket] = null;
    }
    if (this[kWs]) {
      for (const conn of this[kWs].connections) {
        conn.close();
      }
    }
    process.nextTick(() => {
      this.emit('close');
      cb();
    });
  }

  ref() {}

  unref() {}

  async [kListen]({ port, host }) {
    if (this[kClosed]) throw new ERR_SERVER_DESTROYED();

    if (port !== undefined && port !== null && Number.isNaN(Number(port))) {
      throw new ERR_SOCKET_BAD_PORT(port);
    }

    port = port === undefined || port === null ? 0 : Number(port);

    const lookupAddress = await dns.lookup(host);

    this[kAddress] = {
      ...lookupAddress,
      port,
    };

    if (this[kAddress].address.startsWith('[')) throw new ERR_ENOTFOUND(this[kAddress].address);

    const parsedAddress = ipaddr.parse(this[kAddress].address);
    this[kAddress].family = parsedAddress.kind() === 'ipv6' ? 'IPv6' : 'IPv4';
    const longAddress = parsedAddress.toNormalizedString();

    const app = this[kApp];

    const onRequest = (method: string) => (res: uws.HttpResponse, req: uws.HttpRequest) => {
      const socket = new HTTPSocket(this, res, method === 'GET' || method === 'HEAD');
      const request = new Request(req, socket, method);
      const response = new Response(socket);
      if (request.headers.upgrade) {
        this.emit('upgrade', request, socket);
      }
      this[kHandler](request, response);
    };

    app
      .connect('/*', onRequest('CONNECT'))
      .del('/*', onRequest('DELETE'))
      .get('/*', onRequest('GET'))
      .head('/*', onRequest('HEAD'))
      .options('/*', onRequest('OPTIONS'))
      .patch('/*', onRequest('PATCH'))
      .post('/*', onRequest('POST'))
      .put('/*', onRequest('PUT'))
      .trace('/*', onRequest('TRACE'));

    if (port !== 0 && mainServer[port]) {
      this[kWs] = mainServer[port][kWs];
    }

    if (this[kWs]) {
      this[kWs].addServer(this);
    }

    return new Promise((resolve, reject) => {
      const onListen = (listenSocket) => {
        if (!listenSocket) return reject(new ERR_ADDRINUSE(this[kAddress].address, port));
        this[kListenSocket] = listenSocket;
        port = this[kAddress].port = uws.us_socket_local_port(listenSocket);
        if (!mainServer[port]) mainServer[port] = this;
        resolve();
      };

      this[kListenAll] = host === 'localhost';
      if (this[kListenAll]) {
        app.listen(port, onListen);
      } else {
        app.listen(longAddress, port, onListen);
      }
    });
  }
}
