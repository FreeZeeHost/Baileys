import makeWASocket from './Socket/index.js';
export * from './Socket/index.js';
export * from './Utils/index.js';
export * from './Types/index.js';
export * from './Store/index.js';
export * from './Defaults/index.js';
export * from './WABinary/index.js';
export * from '../WAProto/index.js';

import { makeFreeZeeSocket } from './Utils/freezee-socket.js';
import { patchSocket } from './Utils/socket-patcher.js';

export { makeWASocket, makeFreeZeeSocket, patchSocket };
export default makeFreeZeeSocket;
