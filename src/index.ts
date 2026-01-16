import type {
  ContextConfigDefault,
  FastifyBaseLogger,
  FastifyInstance,
  FastifyRequest,
  FastifySchema,
  FastifyServerFactory,
  FastifyTypeProvider,
  FastifyTypeProviderDefault,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault,
  RequestGenericInterface,
  RouteGenericInterface,
} from 'fastify';
import type WebSocket from 'ws';
import { Server } from './server';

export const serverFactory: FastifyServerFactory<any> = (handler, options) => {
  return new Server(handler, options);
};

export { default as websocket } from './plugin-websocket';

declare module 'fastify' {
  interface RouteShorthandOptions<RawServer extends RawServerBase = RawServerDefault> {
    websocket?: boolean;
  }

  interface RouteShorthandMethod<
    RawServer extends RawServerBase = RawServerDefault,
    RawRequest extends
      RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
    RawReply extends RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
    TypeProvider extends FastifyTypeProvider = FastifyTypeProviderDefault,
    Logger extends FastifyBaseLogger = FastifyBaseLogger,
  > {
    <
      RequestGeneric extends RequestGenericInterface = RequestGenericInterface,
      ContextConfig = ContextConfigDefault,
      SchemaCompiler extends FastifySchema = FastifySchema,
      TypeProvider extends FastifyTypeProvider = FastifyTypeProviderDefault,
      Logger extends FastifyBaseLogger = FastifyBaseLogger,
    >(
      path: string,
      opts: RouteShorthandOptions<
        RawServer,
        RawRequest,
        RawReply,
        RequestGeneric,
        ContextConfig,
        SchemaCompiler,
        TypeProvider,
        Logger
      > & { websocket: true }, // Trigger when websocket is true
      handler?: (
        socket: WebSocket, // The type from 'ws'
        req: FastifyRequest<
          RequestGeneric,
          RawServer,
          RawRequest,
          SchemaCompiler,
          TypeProvider,
          ContextConfig,
          Logger
        >,
      ) => void | Promise<any>,
    ): FastifyInstance<RawServer, RawRequest, RawReply, Logger, TypeProvider>;
  }
}
