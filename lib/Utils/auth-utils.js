import * as all from './generics.js';
export const { 
    initAuthCreds, generateSignalPubKey, addTransactionCapability, 
    generateLoginNode, getNextPreKeysNode, xmppSignedPreKey,
    parseAndInjectE2ESessions, updateConnectionWithSync, getPreKeys,
    MISSING_KEYS_ERROR_TEXT, getPreKeysCount, generateRecipientNodes, 
    decryptMessageNode, bytesToCrockford
} = all;
export { makeCacheableSignalKeyStore } from './auth-utils.js'; // Keep existing if any
