export * from './generics.js';
export * from './use-mongo-file-auth-state.js';
export * from './socket-patcher.js';
export * from './freezee-socket.js';

import * as all from './generics.js';
export const { 
    baileysVersion, BufferJSON, initAuthCreds, generateMdTagPrefix, delay, toNumber, 
    unixTimestampSeconds, unpadRandomMax16, writeRandomPadMax16, encodeWAMessage, 
    generateRegistrationId, generateMessageID, Browsers, 
    fetchLatestBaileysVersion, getKeyAuthor, trimUndefined, getCodeFromWSError, 
    getErrorCodeFromStreamError, bytesToCrockford, encodeNewsletterMessage,
    sha256, hmacSha256, hmacSign, aesEncrypt, aesDecrypt, Curve,
    generateSignalPubKey, bindWaitForEvent, promiseTimeout
} = all;

export const bindWaitForConnectionUpdate = (ev) => all.bindWaitForEvent(ev, 'connection.update');
