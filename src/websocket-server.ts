import uws from 'uWebSockets.js';
import { EventEmitter } from 'eventemitter3';
import { Duplex } from 'streamx';
import { HTTPSocket } from './http-socket';
import { Request } from './request';
import { Response } from './response';
import type { Server } from './server';
import { kApp, kEnded, kHandler, kTopic, kWs } from './symbols';

const defaultWebSocketConfig = {
  compression: uws.SHARED_COMPRESSOR,
  maxPayloadLength: 16 * 1024 * 1024,
  idleTimeout: 16,
};

const SEP = '!';
const SEP_BUFFER = Buffer.from(SEP);

export class WebSocket extends EventEmitter {
  namespace: Buffer;
  connection: uws.WebSocket<any>;

  static allocTopic(namespace: Buffer, topic: Buffer | string) {
    if (topic[kTopic]) return topic;

    const buf = Buffer.concat([
      namespace,
      SEP_BUFFER,
      Buffer.isBuffer(topic) ? topic : Buffer.from(topic),
    ]);

    buf[kTopic] = true;
    return buf;
  }

  constructor(namespace, connection, topics = {}) {
    super();

    this.namespace = namespace;
    this.connection = connection;
    connection.websocket = this;
    this.topics = topics; // we maintain a cache of buffer topics
    this[kEnded] = false;
  }

  get uws() {
    return true;
  }

  allocTopic(topic: Buffer | string) {
    if (this.topics[topic]) return this.topics[topic];
    return WebSocket.allocTopic(this.namespace, topic);
  }

  send(message: uws.RecognizedString, isBinary: boolean, compress: boolean) {
    if (this[kEnded]) return;
    return this.connection.send(message, isBinary, compress);
  }

  publish(
    topic: Buffer | string,
    message: uws.RecognizedString,
    isBinary: boolean,
    compress: boolean,
  ) {
    if (this[kEnded]) return;
    return this.connection.publish(this.allocTopic(topic), message, isBinary, compress);
  }

  subscribe(topic: Buffer | string) {
    if (this[kEnded]) return;
    return this.connection.subscribe(this.allocTopic(topic));
  }

  unsubscribe(topic: Buffer | string) {
    if (this[kEnded]) return;
    return this.connection.unsubscribe(this.allocTopic(topic));
  }

  isSubscribed(topic: Buffer | string) {
    if (this[kEnded]) return false;
    return this.connection.isSubscribed(this.allocTopic(topic));
  }

  getTopics() {
    if (this[kEnded]) return [];
    return this.connection.getTopics().map((topic) => topic.slice(topic.indexOf(SEP) + 1));
  }

  close() {
    if (this[kEnded]) return;
    this[kEnded] = true;
    return this.connection.close();
  }

  end(code: number, shortMessage: uws.RecognizedString) {
    if (this[kEnded]) return;
    this[kEnded] = true;
    return this.connection.end(code, shortMessage);
  }

  cork(cb: () => void) {
    if (this[kEnded]) return;
    return this.connection.cork(cb);
  }

  getBufferedAmount() {
    if (this[kEnded]) return 0;
    return this.connection.getBufferedAmount();
  }

  ping(message: uws.RecognizedString) {
    if (this[kEnded]) return;
    return this.connection.ping(message);
  }
}

export class WebSocketStream extends Duplex {
  socket: WebSocket;

  constructor(
    socket: WebSocket,
    opts: {
      compress?: boolean | false;
      highWaterMark?: number | 16384;
      mapReadable?: (packet: { data: any; isBinary: boolean }) => any; // optional function to map input data
      byteLengthReadable?: (packet: { data: any; isBinary: boolean }) => number | 1024; // optional function that calculates the byte size of input data,
      mapWritable?: (data: any) => { data: any; isBinary: boolean; compress: boolean }; // optional function to map input data
      byteLengthWritable?: (packet: {
        data: any;
        isBinary: boolean;
        compress: boolean;
      }) => number | 1024; // optional function that calculates the byte size of input data
    } = {},
  ) {
    const { compress = false } = opts;

    super({
      highWaterMark: opts.highWaterMark,
      mapReadable: (packet) => {
        if (opts.mapReadable) return opts.mapReadable(packet);
        return packet.data;
      },
      byteLengthReadable: (packet) => {
        if (opts.byteLengthReadable) return opts.byteLengthReadable(packet);
        return packet.isBinary ? packet.data.byteLength : 1024;
      },
      mapWritable: (data) => {
        if (opts.mapWritable) return opts.mapWritable(data);
        return { data, isBinary: Buffer.isBuffer(data), compress };
      },
      byteLengthWritable: (packet) => {
        if (opts.byteLengthWritable) return opts.byteLengthWritable(packet);
        return packet.isBinary ? packet.data.byteLength : 1024;
      },
    });

    this.socket = socket;
    this._onMessage = this._onMessage.bind(this);
  }

  _open(cb) {
    this.socket.on('message', this._onMessage);
    cb();
  }

  _close(cb) {
    this.socket.off('message', this._onMessage);
    this.socket.close();
    cb();
  }

  _onMessage(data, isBinary) {
    this.push({ data, isBinary });
  }

  _write(packet, cb) {
    this.socket.send(packet.data, packet.isBinary, packet.compress);
    cb();
  }
}

type WSOptions = {
  closeOnBackpressureLimit?: boolean;
  compression?: number;
  idleTimeout?: number;
  maxBackpressure?: number;
  maxLifetime?: number;
  maxPayloadLength?: number;
  sendPingsAutomatically?: boolean;
};

export class WebSocketServer extends EventEmitter {
  constructor(options: WSOptions = {}) {
    super();
    this.options = { ...options, ...defaultWebSocketConfig };
    this.connections = new Set();
  }

  addServer(server: Server) {
    const { options } = this;
    const app: uws.TemplatedApp = server[kApp];
    const listenerHandler = server[kHandler];

    app.ws('/*', {
      upgrade: async (res, req, context) => {
        const method = req.getMethod().toUpperCase();
        const socket = new HTTPSocket(server, res, method === 'GET' || method === 'HEAD');
        const request = new Request(req, socket, method);
        const response = new Response(socket);
        request[kWs] = context;
        server.emit('upgrade', request, socket);
        listenerHandler(request, response);
      },
      open: (ws) => {
        this.connections.add(ws);
        ws.handler(ws);
        this.emit('open', ws);
      },
      close: (ws, code: number, message) => {
        this.connections.delete(ws);
        ws.websocket[kEnded] = true;
        ws.req.socket.destroy();
        const _message = message instanceof ArrayBuffer ? Buffer.from(message) : message;
        ws.websocket.emit('close', code, _message);
        this.emit('close', ws, code, _message);
      },
      drain: (ws: uws.WebSocket<any>) => {
        ws.websocket.emit('drain');
        this.emit('drain', ws);
      },
      message: (ws, message, isBinary) => {
        const _message = message instanceof ArrayBuffer ? Buffer.from(message) : message;
        ws.websocket.emit('message', _message, isBinary);
        this.emit('message', ws, _message, isBinary);
      },
      ping: (ws, message) => {
        const _message = message instanceof ArrayBuffer ? Buffer.from(message) : message;
        ws.websocket.emit('ping', _message);
        this.emit('ping', ws, _message);
      },
      pong: (ws, message) => {
        const _message = message instanceof ArrayBuffer ? Buffer.from(message) : message;
        ws.websocket.emit('pong', _message);
        this.emit('pong', ws, _message);
      },
      ...options,
    });
  }
}
