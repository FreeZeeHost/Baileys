import makeWASocket_raw from './Socket/index.js';
import * as all_utils from './Utils/index.js';
import * as all_generics from './Utils/generics.js';

// --- PRIMARY HYBRID EXPORTS ---
export const makeWASocket = makeWASocket_raw;
export const makeFreeZeeSocket = all_utils.makeFreeZeeSocket;
export const patchSocket = all_utils.patchSocket;
export const makeConn = all_utils.makeFreeZeeSocket;
export const makeClient = all_utils.makeFreeZeeSocket;
export const makeWA = all_utils.makeFreeZeeSocket;

// --- EXPLICIT NAMED EXPORTS (FOR ESM detected by Node.js V25) ---
export const {
    baileysVersion, initAuthCreds, BufferJSON, Curve, 
    generateSignalPubKey, bytesToCrockford, delay, toNumber,
    sha256, hmacSha256, hmacSign, aesEncrypt, aesDecrypt,
    extractMessageContent, getContentType, generateWAMessage,
    generateMessageID, fetchLatestBaileysVersion, getKeyAuthor,
    trimUndefined, getCodeFromWSError, getErrorCodeFromStreamError,
    useMongoFileAuthState
} = all_generics;

// CommonJS Backward Compatibility
export default makeFreeZeeSocket;
