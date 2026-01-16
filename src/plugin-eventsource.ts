import type { FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { pushable } from 'it-pushable';
import toStream from 'it-to-stream';

/**
 * @deprecated
 * 
 * Please use the official `@fastify/sse` instead.
 */
export default fp(
  async (instance, options) => {
    instance.decorateReply('sse', function (this: FastifyReply, source: MessageEvent) {
      if (!this.raw.headersSent) {
        this.sseContext = { source: pushable({ objectMode: true }) };

        const headers = this.getHeaders();

        for (const [key, value] of Object.entries(headers)) {
          this.raw.setHeader(key, value ?? '');
        }

        this.raw.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        this.raw.setHeader('Connection', 'keep-alive');
        this.raw.setHeader(
          'Cache-Control',
          'private, no-cache, no-store, must-revalidate, max-age=0, no-transform',
        );
        this.raw.setHeader('Pragma', 'no-cache');
        this.raw.setHeader('Expire', '0');
        this.raw.setHeader('X-Accel-Buffering', 'no');

        handleAsyncIterable(this, this.sseContext.source);
      }

      if (isAsyncIterable(source)) {
        return handleAsyncIterable(this, source);
      }
      if (!this.sseContext?.source) {
        this.sseContext = { source: pushable({ objectMode: true }) };
        handleAsyncIterable(this, this.sseContext.source);
      }

      this.sseContext.source.push(source);
      return;
    });
  },
  {
    fastify: '5.x',
    name: '@fastify/eventsource',
  },
);

function handleAsyncIterable(reply: FastifyReply, source: AsyncIterable<MessageEvent>): void {
  toStream(transformAsyncIterable(source)).pipe(reply.raw);
}

export async function* transformAsyncIterable(
  source: AsyncIterable<MessageEvent>,
): AsyncIterable<string> {
  for await (const message of source) {
    yield transform(message);
  }
}

function isAsyncIterable<T extends AsyncIterable<unknown>>(source: T | unknown): source is T {
  if (source === null || source === undefined || typeof source !== 'object') return false;
  return Symbol.asyncIterator in source;
}

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
  data?: string | object;
  id?: string;
  event?: string;
  retry?: number;
}

function transform(message: MessageEvent) {
  let data = message.event ? `event: ${message.event}\n` : '';
  data += message.id ? `id: ${message.id}\n` : '';
  data += message.retry ? `retry: ${message.retry}\n` : '';
  data += message.data ? toDataString(message.data) : '';
  data += '\n';
  return data;
}
