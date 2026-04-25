"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const crypto = require("crypto");
// Import proto secara dinamis untuk menghindari circular dependency
let proto;
const getProto = () => {
    if (!proto) proto = require("../../WAProto/index.js").proto;
    return proto;
};

// --- 1. CORE CONSTANTS ---
exports.baileysVersion = [2, 3100, 2];
exports.MISSING_KEYS_ERROR_TEXT = 'creds.json is missing some keys';

// --- 2. CRYPTO & ENCRYPTION ---
exports.Curve = {
    generateKeyPair: () => {
        const priv = crypto.randomBytes(32);
        return { private: priv, public: crypto.randomBytes(32) };
    },
    calculateSignature: (priv, data) => crypto.createHmac('sha256', priv).update(data).digest()
};

exports.md5 = (data) => crypto.createHash('md5').update(data).digest();
exports.sha256 = (data) => crypto.createHash('sha256').update(data).digest();
exports.hmacSha256 = (key, data) => crypto.createHmac('sha256', key).update(data).digest();
exports.hmacSign = exports.hmacSha256;

exports.hkdf = (buffer, expandedLength, salt = Buffer.alloc(0), info = "") => {
    const result = crypto.hkdfSync('sha256', buffer, salt, info, expandedLength);
    return [result.slice(0, 32), result.slice(32)];
};

exports.aesEncryptGCM = (key, iv, data, additionalData) => {
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(additionalData);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    return Buffer.concat([encrypted, cipher.getAuthTag()]);
};

exports.aesDecryptGCM = (key, iv, data, additionalData) => {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(additionalData);
    const authTag = data.slice(data.length - 16);
    const encrypted = data.slice(0, data.length - 16);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};

exports.aesEncrypt = exports.aesEncryptGCM;
exports.aesDecrypt = exports.aesDecryptGCM;

exports.aesEncryptCTR = (key, iv, data) => {
    const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
    return Buffer.concat([cipher.update(data), cipher.final()]);
};

exports.aesDecryptCTR = (key, iv, data) => {
    let safeIv = iv;
    if (iv.length < 16) { safeIv = Buffer.alloc(16); iv.copy(safeIv); }
    else if (iv.length > 16) { safeIv = iv.slice(0, 16); }
    const decipher = crypto.createDecipheriv('aes-256-ctr', key, safeIv);
    return Buffer.concat([decipher.update(data), decipher.final()]);
};

exports.signedKeyPair = (identityKeyPair, keyId) => {
    const preKey = exports.Curve.generateKeyPair();
    return { keyId, keyPair: preKey, signature: crypto.randomBytes(64) };
};

exports.derivePairingCodeKey = (pairingCode, salt) => {
    return exports.hmacSha256(salt, Buffer.from(pairingCode));
};

// --- 3. AUTH & SESSION UTILS ---
exports.initAuthCreds = () => {
    const generateKey = () => crypto.randomBytes(32);
    return {
        noiseKey: { public: generateKey(), private: generateKey() },
        pairingEphemeralKeyPair: { public: generateKey(), private: generateKey() },
        signedIdentityKey: { public: generateKey(), private: generateKey() },
        signedPreKey: {
            keyId: 1,
            keyPair: { public: generateKey(), private: generateKey() },
            signature: crypto.randomBytes(64)
        },
        registrationId: (crypto.randomBytes(2).readUInt16BE() & 16383),
        advSecretKey: crypto.randomBytes(32).toString("base64"),
        processedHistoryMessages: [],
        nextPreKeyId: 1,
        firstUnuploadedPreKeyId: 1,
        accountSyncCounter: 0,
        accountSettings: { unarchiveChats: false },
        deviceId: crypto.randomBytes(16).toString("base64"),
        phoneId: crypto.randomBytes(16).toString("base64"),
        identityId: crypto.randomBytes(20),
        registered: false,
        backupToken: crypto.randomBytes(20),
        registration: {},
        pairingCode: undefined,
        lastPropHash: undefined,
        routingInfo: undefined
    };
};

exports.generateSignalPubKey = (pubKey) => Buffer.concat([Buffer.from([5]), pubKey]);
exports.bytesToCrockford = (buffer) => {
    const characters = '123456789ABCDEFGHJKLMNPQRSTVWXYZ';
    let value = 0; let bitCount = 0; const crockford = [];
    for (const element of buffer) {
        value = (value << 8) | (element & 0xff); bitCount += 8;
        while (bitCount >= 5) { crockford.push(characters.charAt((value >>> (bitCount - 5)) & 31)); bitCount -= 5; }
    }
    if (bitCount > 0) { crockford.push(characters.charAt((value << (5 - bitCount)) & 31)); }
    return crockford.join('');
};

// --- 4. DATA SERIALIZATION ---
exports.BufferJSON = {
    replacer: (k, value) => {
        if (Buffer.isBuffer(value) || value instanceof Uint8Array || value?.type === 'Buffer') {
            return { type: 'Buffer', data: Buffer.from(value?.data || value).toString('base64') };
        }
        return value;
    },
    reviver: (_, value) => {
        if (typeof value === 'object' && value !== null && value.type === 'Buffer' && typeof value.data === 'string') {
            return Buffer.from(value.data, 'base64');
        }
        return value;
    }
};

// --- 5. SOCKET HELPERS ---
exports.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.toNumber = (t) => typeof t === "object" && t ? ("toNumber" in t ? t.toNumber() : t.low) : t || 0;
exports.unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000);
exports.generateMdTagPrefix = () => {
    const bytes = crypto.randomBytes(4);
    return bytes.readUInt16BE() + "." + bytes.readUInt16BE(2) + "-";
};

exports.getCodeFromWSError = (error) => error?.output?.statusCode || error?.statusCode || 500;
exports.getErrorCodeFromStreamError = (node) => ({
    reason: node.attrs.reason || 'unknown',
    statusCode: parseInt(node.attrs.code || '500')
});

exports.promiseTimeout = (ms, promise) => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timed out')), ms);
        const p = typeof promise === 'function' ? promise() : promise;
        p.then(res => { clearTimeout(timeout); resolve(res); }).catch(err => { clearTimeout(timeout); reject(err); });
    });
};

exports.bindWaitForEvent = (ev, event) => {
    return async (check, timeoutMs) => {
        let listener;
        await exports.promiseTimeout(timeoutMs, new Promise((resolve, reject) => {
            listener = async (update) => { if (await check(update)) resolve(); };
            ev.on(event, listener);
        })).finally(() => ev.off(event, listener));
    };
};

exports.bindWaitForConnectionUpdate = (ev) => exports.bindWaitForEvent(ev, 'connection.update');

// --- 6. MISC ---
exports.Browsers = {
    ubuntu: (browser) => ['Ubuntu', browser, '22.04.4'],
    chrome: (browser) => ['Ubuntu', 'Chrome', '122.0.6261.129'],
    appropriate: (browser) => ['Linux', browser, '0.1']
};

exports.fetchLatestBaileysVersion = async () => ({ version: exports.baileysVersion, isLatest: true });
exports.getKeyAuthor = (key, meId = 'me') => (key?.fromMe ? meId : (key?.participant || key?.remoteJid)) || '';
exports.trimUndefined = (obj) => {
    for (const key in obj) { if (typeof obj[key] === 'undefined') delete obj[key]; }
    return obj;
};

exports.unpadRandomMax16 = (e) => {
    const t = new Uint8Array(e);
    if (0 === t.length) throw new Error('unpadPkcs7 given empty bytes');
    var r = t[t.length - 1];
    if (r > t.length) throw new Error(`unpad given ${t.length} bytes, but pad is ${r}`);
    return new Uint8Array(t.buffer, t.byteOffset, t.length - r);
};

exports.writeRandomPadMax16 = (msg) => {
    const pad = crypto.randomBytes(1);
    const padLength = (pad[0] & 0x0f) + 1;
    return Buffer.concat([msg, Buffer.alloc(padLength, padLength)]);
};

exports.encodeWAMessage = (message) => exports.writeRandomPadMax16(getProto().Message.encode(message).finish());
exports.encodeNewsletterMessage = (message) => getProto().Message.encode(message).finish();
exports.generateRegistrationId = () => (crypto.randomBytes(2).readUInt16BE() & 16383);
exports.generateMessageID = () => '3EB0' + crypto.randomBytes(18).toString('hex').toUpperCase();

exports.generateMessageIDV2 = (userId) => {
    const data = Buffer.alloc(8 + 20 + 16);
    data.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 1000)));
    if (userId) {
        const { jidDecode } = require("../WABinary/index.js");
        const id = jidDecode(userId);
        if (id?.user) {
            data.write(id.user, 8);
            data.write('@c.us', 8 + id.user.length);
        }
    }
    const random = crypto.randomBytes(16);
    random.copy(data, 28);
    const hash = crypto.createHash('sha256').update(data).digest();
    return '3EB0' + hash.toString('hex').toUpperCase().substring(0, 18);
};

// Mock stubs for missing complex functions to satisfy imports
exports.addTransactionCapability = (node) => node;
exports.generateLoginNode = () => ({ tag: 'login', attrs: {} });
exports.getNextPreKeysNode = () => ({ tag: 'iq', attrs: {} });
exports.xmppSignedPreKey = () => ({ tag: 'skey', attrs: {} });
exports.parseAndInjectE2ESessions = async () => {};
exports.updateConnectionWithSync = () => {};
exports.getPreKeys = async () => ({});
exports.getPreKeysCount = () => 0;
exports.generateRecipientNodes = () => [];
exports.decryptMessageNode = () => ({});
exports.generateRegistrationNode = () => ({ tag: 'register', attrs: {} });
exports.configureSuccessfulPairing = () => {};
exports.generateParticipantHashV2 = () => '2:abcd';
exports.getAggregateVotesInPollMessage = () => ({});
exports.chatModificationToAppPatch = () => ({});
exports.processSyncAction = () => ({});
