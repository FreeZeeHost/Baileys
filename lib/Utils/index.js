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
export * from './baileys-event-stream.js';
export * from './use-mongo-file-auth-state.js';
export * from './socket-patcher.js';
export * from './freezee-socket.js';

// Explicit re-exports for ESM compatibility with Baileys core
import * as generics from './generics.js';
export const { 
    delay, toNumber, unixTimestampSeconds, generateMdTagPrefix, 
    bytesToCrockford, promiseTimeout, bindWaitForEvent,
    initAuthCreds, generateRegistrationId, unpadRandomMax16,
    writeRandomPadMax16, encodeWAMessage, generateMessageID,
    generateMessageIDV2, Browsers, fetchLatestBaileysVersion,
    getKeyAuthor, trimUndefined
} = generics;

export const bindWaitForConnectionUpdate = (ev) => generics.bindWaitForEvent(ev, 'connection.update');

import * as crypto from './crypto.js';
export const { 
    sha256, hmacSha256, hkdf, aesEncryptCTR, aesDecryptCTR,
    aesEncryptGCM, aesDecryptGCM, md5, signedKeyPair,
    derivePairingCodeKey
} = crypto;

import * as auth from './auth-utils.js';
export const {
    addTransactionCapability, generateLoginNode, getNextPreKeysNode,
    xmppSignedPreKey, generateSignalPubKey
} = auth;

import * as validate from './validate-connection.js';
export const {
    generateRegistrationNode, configureSuccessfulPairing
} = validate;

import * as messages from './messages.js';
export const {
    extractMessageContent, getContentType, normalizeMessageContent,
    generateWAMessageFromContent, generateWAMessage, prepareWAMessageMedia,
    downloadMediaMessage
} = messages;
