import type { FastifyServerFactory, RawServerBase, RawServerDefault } from 'fastify';
import { Server } from './server';

export const serverFactory: FastifyServerFactory<any> = (handler, opts) =>
  new Server(handler, opts);

export { default as websocket } from './plugin-websocket';
export { default as eventsource } from './plugin-eventsource';

declare module 'fastify' {
  interface RouteShorthandOptions<RawServer extends RawServerBase = RawServerDefault> {
    websocket?: boolean;
  }

  interface FastifyReply {
    sse(source: MessageEvent): void;
  }
}

interface MessageEvent {
  data?: string | object;
  id?: string;
  event?: string;
  retry?: number;
}
