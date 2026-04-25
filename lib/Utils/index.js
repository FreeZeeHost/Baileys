// --- THE SINGULARITY INDEX (1000% STABLE) ---

import * as all from './generics.js';
import * as messages from './messages.js';
import * as history from './history.js';
import * as chatUtils from './chat-utils.js';

// Export everything from generics explicitly
export const { 
    baileysVersion, BufferJSON, initAuthCreds, generateMdTagPrefix, delay, toNumber, 
    unixTimestampSeconds, unpadRandomMax16, writeRandomPadMax16, encodeWAMessage, 
    generateRegistrationId, generateMessageID, generateMessageIDV2, Browsers, 
    fetchLatestBaileysVersion, getKeyAuthor, trimUndefined, getCodeFromWSError, 
    getErrorCodeFromStreamError, bytesToCrockford, encodeNewsletterMessage,
    sha256, hmacSha256, hkdf, aesEncryptCTR, aesDecryptCTR, aesEncryptGCM, 
    aesDecryptGCM, md5, signedKeyPair, derivePairingCodeKey, Curve,
    addTransactionCapability, generateLoginNode, getNextPreKeysNode,
    xmppSignedPreKey, generateSignalPubKey, parseAndInjectE2ESessions,
    updateConnectionWithSync, getPreKeys, MISSING_KEYS_ERROR_TEXT,
    getPreKeysCount, generateRecipientNodes, decryptMessageNode,
    generateRegistrationNode, configureSuccessfulPairing, generateParticipantHashV2,
    bindWaitForEvent, promiseTimeout
} = all;

export const bindWaitForConnectionUpdate = (ev) => all.bindWaitForEvent(ev, 'connection.update');

// Export from other modules
export const {
    extractMessageContent, getContentType, normalizeMessageContent,
    generateWAMessageFromContent, generateWAMessage, prepareWAMessageMedia,
    downloadMediaMessage, assertMediaContent, getAggregateVotesInPollMessage
} = messages;

export const { getHistoryMsg, downloadHistory, processHistoryMessage } = history;
export const { 
    chatModificationToAppPatch, decodePatches, decodeSyncdSnapshot, 
    encodeSyncdPatch, extractSyncdPatches, generateProfilePicture, 
    processSyncAction, newLTHashState 
} = chatUtils;

// Premium Features
export { makeFreeZeeSocket } from './freezee-socket.js';
export { patchSocket } from './socket-patcher.js';
export { useMongoFileAuthState } from './use-mongo-file-auth-state.js';

import { makeEventBuffer } from './event-buffer.js';
export { makeEventBuffer };

import { makeNoiseHandler } from './noise-handler.js';
export { makeNoiseHandler };

import { MessageRetryManager } from './message-retry-manager.js';
export { MessageRetryManager };
