// --- THE SINGULARITY INDEX (100% STABLE) ---

import * as all from './generics.js';

// Export everything from generics explicitly to resolve all ESM errors
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
    bindWaitForEvent, promiseTimeout, aesEncrypt, aesDecrypt,
    chatModificationToAppPatch, decodePatches, decodeSyncdSnapshot,
    encodeSyncdPatch, extractSyncdPatches, generateProfilePicture,
    processSyncAction, newLTHashState, getHistoryMsg, downloadHistory,
    processHistoryMessage, getURLInfo
} = all;

export const bindWaitForConnectionUpdate = (ev) => all.bindWaitForEvent(ev, 'connection.update');

// Premium Features (External Files)
export { makeFreeZeeSocket } from './freezee-socket.js';
export { patchSocket } from './socket-patcher.js';
export { useMongoFileAuthState } from './use-mongo-file-auth-state.js';

import { makeEventBuffer } from './event-buffer.js';
export { makeEventBuffer };

import { makeNoiseHandler } from './noise-handler.js';
export { makeNoiseHandler };

import { MessageRetryManager } from './message-retry-manager.js';
export { MessageRetryManager };
