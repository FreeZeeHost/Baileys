export * from '../WAProto/index.js';
export * from './Utils/index.js';
export * from './Types/index.js';
export * from './Defaults/index.js';
export * from './WABinary/index.js';
export * from './WAM/index.js';
export * from './WAUSync/index.js';
import { makeFreeZeeSocket, patchSocket, useMongoFileAuthState } from './Utils/index.js';
import makeWASocket_raw from './Socket/index.js';

export const makeWASocket = makeFreeZeeSocket;
export { makeFreeZeeSocket, patchSocket, useMongoFileAuthState, makeWASocket_raw };
export default makeFreeZeeSocket;
