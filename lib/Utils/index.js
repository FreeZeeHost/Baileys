import * as all from './generics.js';
import { useMongoFileAuthState as mongoAuth } from './use-mongo-file-auth-state.js';
import { patchSocket as patcher } from './socket-patcher.js';
import { makeFreeZeeSocket as freezer } from './freezee-socket.js';

export const { 
    baileysVersion, BufferJSON, initAuthCreds, generateMdTagPrefix, delay, toNumber, 
    unixTimestampSeconds, unpadRandomMax16, writeRandomPadMax16, encodeWAMessage, 
    generateRegistrationId, generateMessageID, generateMessageIDV2, Browsers, 
    fetchLatestBaileysVersion, getKeyAuthor, trimUndefined, getCodeFromWSError, 
    getErrorCodeFromStreamError, bytesToCrockford, encodeNewsletterMessage,
    sha256, hmacSha256, hmacSign, aesEncrypt, aesDecrypt, Curve,
    generateSignalPubKey, bindWaitForEvent, promiseTimeout, xmppSignedPreKey,
    xmppPreKey, addTransactionCapability, generateLoginNode, getNextPreKeysNode,
    parseAndInjectE2ESessions, updateConnectionWithSync, getPreKeys,
    getPreKeysCount, generateRecipientNodes, decryptMessageNode,
    generateRegistrationNode, configureSuccessfulPairing, generateParticipantHashV2,
    chatModificationToAppPatch, processSyncAction, newLTHashState, getHistoryMsg,
    MISSING_KEYS_ERROR_TEXT, NO_MESSAGE_FOUND_ERROR_TEXT, NACK_REASONS,
    decodePatches, decodeSyncdSnapshot, encodeSyncdPatch, extractSyncdPatches,
    generateProfilePicture, aesEncryptCTR, aesDecryptCTR, aesEncryptGCM,
    aesDecryptGCM, signedKeyPair, derivePairingCodeKey, encodeBigEndian,
    encodeSignedDeviceIdentity, decodeSignedDeviceIdentity, extractAddressingContext,
    getWAUploadToServer, getUrlFromDirectPath, getStatusCodeForMediaRetry,
    cleanMessage, decodeMessageNode, decryptMediaRetryData, decodeMediaRetryNode,
    encryptMediaRetryRequest, getCallStatusFromNode, getStatusFromReceiptType,
    getNextPreKeys, extractDeviceJids, jidNormalizedUser, areJidsSameUser,
    isJidGroup, isJidUser, isJidBroadcast, isJidNewsletter, isLidUser, getDevice,
    S_WHATSAPP_NET, OFFICIAL_BIZ_JID, hkdf, md5
} = all;

export const bindWaitForConnectionUpdate = (ev) => all.bindWaitForEvent(ev, 'connection.update');

export const useMongoFileAuthState = mongoAuth;
export const patchSocket = patcher;
export const makeFreeZeeSocket = freezer;

export * from './messages.js';
export * from './messages-media.js';
export * from './history.js';
export * from './link-preview.js';
export * from './lt-hash.js';
export * from './make-mutex.js';

import { makeEventBuffer } from './event-buffer.js';
export { makeEventBuffer };

import { makeNoiseHandler } from './noise-handler.js';
export { makeNoiseHandler };

import { MessageRetryManager } from './message-retry-manager.js';
export { MessageRetryManager };
