import createError from '@fastify/error';

export const ERR_INVALID_METHOD = createError('HPE_INVALID_METHOD', 'Invalid method encountered');
export const ERR_HEAD_SET = createError(
  'ERR_HEAD_SET',
  'Cannot set headers after they are sent to the client',
);
export const ERR_ADDRINUSE = createError(
  'EADDRINUSE',
  'listen EADDRINUSE: address already in use %s:%s',
);
export const ERR_UPGRADE = createError('ERR_UPGRADE', 'Cannot upgrade to WebSocket protocol %o');
export const ERR_STREAM_DESTROYED = createError('ERR_STREAM_DESTROYED', 'Stream destroyed');
export const ERR_UWS_APP_NOT_FOUND = createError(
  'ERR_UWS_APP_NOT_FOUND',
  'uWebSockets app not found',
);
export const ERR_ENOTFOUND = createError('ERR_ENOTFOUND', 'getaddrinfo ENOTFOUND %s');
export const ERR_SOCKET_BAD_PORT = createError(
  'ERR_SOCKET_BAD_PORT',
  'RangeError [ERR_SOCKET_BAD_PORT]: options.port should be >= 0 and < 65536. Received (%s)',
);
export const ERR_SERVER_DESTROYED = createError('ERR_SERVER_DESTROYED', 'Server destroyed');
