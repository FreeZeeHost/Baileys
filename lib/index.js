import { makeFreeZeeSocket, patchSocket, useMongoFileAuthState } from './Utils/index.js';
import makeWASocket_raw from './Socket/index.js';

// Export everything from all sub-folders except Socket (to avoid conflicts)
export * from './Utils/index.js';
export * from './Types/index.js';
export * from './Defaults/index.js';
export * from './WABinary/index.js';
export * from './WAM/index.js';
export * from './WAUSync/index.js';
export * from '../WAProto/index.js';

// Explicitly export from Socket modules, avoiding makeWASocket collision
export * from './Socket/socket.js';
export * from './Socket/messages-send.js';
export * from './Socket/messages-recv.js';
export * from './Socket/chats.js';
export * from './Socket/groups.js';
export * from './Socket/newsletter.js';
export * from './Socket/business.js';
export * from './Socket/community.js';
export * from './Socket/usync.js';

// Define the primary socket export (FreeZeeHost version)
export const makeWASocket = makeFreeZeeSocket;
export { makeFreeZeeSocket, patchSocket, useMongoFileAuthState, makeWASocket_raw };
export default makeFreeZeeSocket;
