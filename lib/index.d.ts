import { proto } from '../WAProto';
import makeWASocket from './Socket';
import { Browsers, fetchLatestBaileysVersion, useMultiFileAuthState, useMongoFileAuthState, delay, patchSocket, makeSessionManager, withStealthMode, withSmartQueue, withMiddleware, withMediaEngine } from './Utils';
import { DisconnectReason } from './Types';
import { makeInMemoryStore } from './Store';
import { jidDecode, jidEncode } from './WABinary';

export * from '../WAProto';
export * from './Utils';
export * from './Types';
export * from './Store';
export * from './Defaults';
export * from './WABinary';
export * from './WAM';
export * from './WAUSync';

export type WASocket = ReturnType<typeof makeWASocket>;
export { 
    makeWASocket, 
    proto, 
    Browsers, 
    fetchLatestBaileysVersion, 
    useMultiFileAuthState, 
    useMongoFileAuthState, 
    delay, 
    patchSocket, 
    makeSessionManager, 
    withStealthMode, 
    withSmartQueue, 
    withMiddleware, 
    withMediaEngine,
    DisconnectReason,
    makeInMemoryStore,
    jidDecode,
    jidEncode
};
export default makeWASocket;
