import type { FastifyReply } from 'fastify';
import { Writable, Readable, Transform } from 'stream';
import fp from 'fastify-plugin';

import { kWs, kRes } from './symbols';

export default fp(
  async (instance, options) => {
    instance.decorateReply('sse', function (this: FastifyReply, source: MessageEvent) {
      if (this.raw.socket.aborted) return;

      if (!this.raw.headersSent) {
        this.raw.setHeader('Content-Type', 'text/event-stream');
        this.raw.setHeader('Connection', 'keep-alive');
        this.raw.setHeader(
          'Cache-Control',
          'private, no-cache, no-store, must-revalidate, max-age=0, no-transform',
        );
        this.raw.setHeader('Pragma', 'no-cache');
        this.raw.setHeader('Expire', '0');
        this.raw.setHeader('X-Accel-Buffering', 'no');
      }

      const res = this.raw.socket[kRes];

      res.cork(() => {
        res.write(transform(source));
      });

      res.onAborted(() => {
        this.raw.socket.aborted = true;
      });
    });
  },
  {
    fastify: '4.x',
    name: '@fastify/eventsource',
  },
);

const isUndefined = (obj: any): obj is undefined => typeof obj === 'undefined';
const isNil = (val: any): val is null | undefined => isUndefined(val) || val === null;
const isObject = (fn: any): fn is object => !isNil(fn) && typeof fn === 'object';

function toDataString(data: string | object): string {
  if (isObject(data)) {
    return toDataString(JSON.stringify(data));
  }

  return data
    .split(/\r\n|\r|\n/)
    .map((line) => `data: ${line}\n`)
    .join('');
}

interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

function transform(message: MessageEvent) {
  let data = message.type ? `event: ${message.type}\n` : '';
  data += message.id ? `id: ${message.id}\n` : '';
  data += message.retry ? `retry: ${message.retry}\n` : '';
  data += message.data ? toDataString(message.data) : '';
  data += '\n';
  return data;
}
