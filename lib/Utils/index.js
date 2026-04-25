export * from './generics.js';
export * from './crypto.js';
export * from './auth-utils.js';
export * from './validate-connection.js';
export * from './event-buffer.js';
export * from './noise-handler.js';
export * from './messages.js';
export * from './messages-media.js';
export * from './history.js';
export * from './link-preview.js';
export * from './lt-hash.js';
export * from './make-mutex.js';
export * from './make-middleware.js';
export * from './baileys-event-stream.js';
export * from './use-mongo-file-auth-state.js';
export * from './socket-patcher.js';
export * from './freezee-socket.js';

// Explicit binding for some complex helpers
import { bindWaitForEvent } from './generics.js';
export const bindWaitForConnectionUpdate = (ev) => bindWaitForEvent(ev, 'connection.update');
