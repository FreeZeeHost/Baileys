import * as generics from './generics.js';
import * as crypto_mod from './crypto.js';
import * as auth_mod from './auth-utils.js';
import * as validate_mod from './validate-connection.js';
import * as messages_mod from './messages.js';
import * as history_mod from './history.js';
import * as ltHash_mod from './lt-hash.js';
import * as chatUtils_mod from './chat-utils.js';

// Re-export Generics
export const { 
    baileysVersion, BufferJSON, initAuthCreds, generateMdTagPrefix, delay, toNumber, 
    unixTimestampSeconds, unpadRandomMax16, writeRandomPadMax16, encodeWAMessage, 
    generateRegistrationId, generateMessageID, generateMessageIDV2, Browsers, 
    fetchLatestBaileysVersion, getKeyAuthor, trimUndefined, getCodeFromWSError, 
    getErrorCodeFromStreamError, bytesToCrockford, encodeNewsletterMessage 
} = generics;

export const bindWaitForConnectionUpdate = (ev) => generics.bindWaitForEvent(ev, 'connection.update');
export const bindWaitForEvent = generics.bindWaitForEvent;
export const promiseTimeout = generics.promiseTimeout;

// Re-export Crypto
export const { 
    sha256, hmacSha256, hkdf, aesEncryptCTR, aesDecryptCTR, aesEncryptGCM, 
    aesDecryptGCM, md5, signedKeyPair, derivePairingCodeKey, Curve 
} = crypto_mod;

// Re-export Auth
export const {
    addTransactionCapability, generateLoginNode, getNextPreKeysNode,
    xmppSignedPreKey, generateSignalPubKey, parseAndInjectE2ESessions,
    updateConnectionWithSync, getPreKeys, MISSING_KEYS_ERROR_TEXT,
    getPreKeysCount, generateRecipientNodes, decryptMessageNode
} = auth_mod;

// Others
export const { generateRegistrationNode, configureSuccessfulPairing } = validate_mod;
export const {
    extractMessageContent, getContentType, normalizeMessageContent,
    generateWAMessageFromContent, generateWAMessage, prepareWAMessageMedia,
    downloadMediaMessage, assertMediaContent, getAggregateVotesInPollMessage,
    generateParticipantHashV2
} = messages_mod;

export const { getHistoryMsg, downloadHistory, processHistoryMessage } = history_mod;
export const { newLTHashState } = ltHash_mod;
export const { 
    chatModificationToAppPatch, decodePatches, decodeSyncdSnapshot, 
    encodeSyncdPatch, extractSyncdPatches, generateProfilePicture, 
    processSyncAction 
} = chatUtils_mod;

export { makeFreeZeeSocket } from './freezee-socket.js';
export { patchSocket } from './socket-patcher.js';
export { useMongoFileAuthState } from './use-mongo-file-auth-state.js';

import { makeEventBuffer } from './event-buffer.js';
export { makeEventBuffer };

import { makeNoiseHandler } from './noise-handler.js';
export { makeNoiseHandler };

import { MessageRetryManager } from './message-retry-manager.js';
export { MessageRetryManager };
