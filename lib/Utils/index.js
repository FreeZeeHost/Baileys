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
export * from './use-mongo-file-auth-state.js';
export * from './socket-patcher.js';
export * from './freezee-socket.js';

// EXPLICIT NAMED EXPORTS (FOR NODE V25 COMPATIBILITY)
import * as generics from './generics.js';
export const delay = generics.delay;
export const toNumber = generics.toNumber;
export const unixTimestampSeconds = generics.unixTimestampSeconds;
export const generateMdTagPrefix = generics.generateMdTagPrefix;
export const bytesToCrockford = generics.bytesToCrockford;
export const promiseTimeout = generics.promiseTimeout;
export const bindWaitForEvent = generics.bindWaitForEvent;
export const initAuthCreds = generics.initAuthCreds;
export const generateRegistrationId = generics.generateRegistrationId;
export const unpadRandomMax16 = generics.unpadRandomMax16;
export const writeRandomPadMax16 = generics.writeRandomPadMax16;
export const encodeWAMessage = generics.encodeWAMessage;
export const generateMessageID = generics.generateMessageID;
export const generateMessageIDV2 = generics.generateMessageIDV2;
export const Browsers = generics.Browsers;
export const fetchLatestBaileysVersion = generics.fetchLatestBaileysVersion;
export const getKeyAuthor = generics.getKeyAuthor;
export const trimUndefined = generics.trimUndefined;

export const bindWaitForConnectionUpdate = (ev) => generics.bindWaitForEvent(ev, 'connection.update');

import * as crypto from './crypto.js';
export const sha256 = crypto.sha256;
export const hmacSha256 = crypto.hmacSha256;
export const hkdf = crypto.hkdf;
export const aesEncryptCTR = crypto.aesEncryptCTR;
export const aesDecryptCTR = crypto.aesDecryptCTR;
export const aesEncryptGCM = crypto.aesEncryptGCM;
export const aesDecryptGCM = crypto.aesDecryptGCM;
export const md5 = crypto.md5;
export const signedKeyPair = crypto.signedKeyPair;
export const derivePairingCodeKey = crypto.derivePairingCodeKey;

import * as auth from './auth-utils.js';
export const addTransactionCapability = auth.addTransactionCapability;
export const generateLoginNode = auth.generateLoginNode;
export const getNextPreKeysNode = auth.getNextPreKeysNode;
export const xmppSignedPreKey = auth.xmppSignedPreKey;
export const generateSignalPubKey = auth.generateSignalPubKey;

import * as validate from './validate-connection.js';
export const generateRegistrationNode = validate.generateRegistrationNode;
export const configureSuccessfulPairing = validate.configureSuccessfulPairing;

import * as messages from './messages.js';
export const extractMessageContent = messages.extractMessageContent;
export const getContentType = messages.getContentType;
export const normalizeMessageContent = messages.normalizeMessageContent;
export const generateWAMessageFromContent = messages.generateWAMessageFromContent;
export const generateWAMessage = messages.generateWAMessage;
export const prepareWAMessageMedia = messages.prepareWAMessageMedia;
export const downloadMediaMessage = messages.downloadMediaMessage;

import { makeEventBuffer } from './event-buffer.js';
export { makeEventBuffer };

import { makeNoiseHandler } from './noise-handler.js';
export { makeNoiseHandler };
