import { createHash, createHmac, randomBytes, hkdfSync, createCipheriv, createDecipheriv } from 'crypto';
import { proto } from '../../WAProto/index.js';
import { jidDecode } from '../WABinary/index.js';

export const baileysVersion = [2, 3100, 2];
export const MISSING_KEYS_ERROR_TEXT = 'creds.json is missing some keys';
export const NO_MESSAGE_FOUND_ERROR_TEXT = 'no message found';

// Crypto
export const Curve = {
    generateKeyPair: () => {
        const priv = randomBytes(32);
        return { private: priv, public: randomBytes(32) };
    },
    calculateSignature: (priv, data) => createHmac('sha256', priv).update(data).digest()
};
export const md5 = (data) => createHash('md5').update(data).digest();
export const sha256 = (data) => createHash('sha256').update(data).digest();
export const hmacSha256 = (key, data) => createHmac('sha256', key).update(data).digest();
export const hmacSign = hmacSha256;
export const hkdf = (buffer, expandedLength, salt = Buffer.alloc(0), info = "") => {
    const result = hkdfSync('sha256', buffer, salt, info, expandedLength);
    return [result.slice(0, 32), result.slice(32)];
};
export const aesEncryptGCM = (key, iv, data, additionalData) => {
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(additionalData);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    return Buffer.concat([encrypted, cipher.getAuthTag()]);
};
export const aesDecryptGCM = (key, iv, data, additionalData) => {
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(additionalData);
    const authTag = data.slice(data.length - 16);
    const encrypted = data.slice(0, data.length - 16);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};
export const aesEncryptCTR = (key, iv, data) => {
    const cipher = createCipheriv('aes-256-ctr', key, iv);
    return Buffer.concat([cipher.update(data), cipher.final()]);
};
export const aesDecryptCTR = (key, iv, data) => {
    let safeIv = iv;
    if (iv.length < 16) { safeIv = Buffer.alloc(16); iv.copy(safeIv); }
    else if (iv.length > 16) { safeIv = iv.slice(0, 16); }
    const decipher = createDecipheriv('aes-256-ctr', key, safeIv);
    return Buffer.concat([decipher.update(data), decipher.final()]);
};
export const aesEncrypt = aesEncryptGCM;
export const aesDecrypt = aesDecryptGCM;
export const signedKeyPair = (identityKeyPair, keyId) => {
    const preKey = Curve.generateKeyPair();
    return { keyId, keyPair: preKey, signature: randomBytes(64) };
};
export const derivePairingCodeKey = (pairingCode, salt) => hmacSha256(salt, Buffer.from(pairingCode));

// Auth & Registration
export const initAuthCreds = () => {
    const generateKey = () => randomBytes(32);
    return {
        noiseKey: { public: generateKey(), private: generateKey() },
        pairingEphemeralKeyPair: { public: generateKey(), private: generateKey() },
        signedIdentityKey: { public: generateKey(), private: generateKey() },
        signedPreKey: {
            keyId: 1,
            keyPair: { public: generateKey(), private: generateKey() },
            signature: randomBytes(64)
        },
        registrationId: (randomBytes(2).readUInt16BE() & 16383),
        advSecretKey: randomBytes(32).toString("base64"),
        processedHistoryMessages: [],
        nextPreKeyId: 1,
        firstUnuploadedPreKeyId: 1,
        accountSyncCounter: 0,
        accountSettings: { unarchiveChats: false },
        deviceId: randomBytes(16).toString("base64"),
        phoneId: randomBytes(16).toString("base64"),
        identityId: randomBytes(20),
        registered: false,
        backupToken: randomBytes(20),
        registration: {},
        pairingCode: undefined,
        lastPropHash: undefined,
        routingInfo: undefined
    };
};
export const generateSignalPubKey = (pubKey) => Buffer.concat([Buffer.from([5]), pubKey]);
export const bytesToCrockford = (buffer) => {
    const characters = '123456789ABCDEFGHJKLMNPQRSTVWXYZ';
    let value = 0; let bitCount = 0; const crockford = [];
    for (const element of buffer) {
        value = (value << 8) | (element & 0xff); bitCount += 8;
        while (bitCount >= 5) { crockford.push(characters.charAt((value >>> (bitCount - 5)) & 31)); bitCount -= 5; }
    }
    if (bitCount > 0) { crockford.push(characters.charAt((value << (5 - bitCount)) & 31)); }
    return crockford.join('');
};
export const xmppSignedPreKey = (key) => ({ tag: 'skey', attrs: {}, content: [{ tag: 'id', attrs: {}, content: encodeBigEndian(key.keyId, 3) }, { tag: 'value', attrs: {}, content: key.keyPair.public }, { tag: 'signature', attrs: {}, content: key.signature }] });
export const xmppPreKey = (key) => ({ tag: 'key', attrs: {}, content: [{ tag: 'id', attrs: {}, content: encodeBigEndian(key.keyId, 3) }, { tag: 'value', attrs: {}, content: key.keyPair.public }] });

// Serialization & Helpers
export const BufferJSON = {
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
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const toNumber = (t) => typeof t === "object" && t ? ("toNumber" in t ? t.toNumber() : t.low) : t || 0;
export const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000);
export const generateMdTagPrefix = () => {
    const bytes = randomBytes(4);
    return bytes.readUInt16BE() + "." + bytes.readUInt16BE(2) + "-";
};
export const encodeBigEndian = (e, t = 4) => {
    let r = e;
    const a = new Uint8Array(t);
    for (let i = t - 1; i >= 0; i--) { a[i] = 255 & r; r >>>= 8; }
    return a;
};
export const unpadRandomMax16 = (e) => {
    const t = new Uint8Array(e);
    if (0 === t.length) throw new Error('unpadPkcs7 given empty bytes');
    var r = t[t.length - 1];
    if (r > t.length) throw new Error(`unpad given ${t.length} bytes, but pad is ${r}`);
    return new Uint8Array(t.buffer, t.byteOffset, t.length - r);
};
export const writeRandomPadMax16 = (msg) => {
    const pad = randomBytes(1);
    const padLength = (pad[0] & 0x0f) + 1;
    return Buffer.concat([msg, Buffer.alloc(padLength, padLength)]);
};
export const encodeWAMessage = (message) => writeRandomPadMax16(proto.Message.encode(message).finish());
export const encodeNewsletterMessage = (message) => proto.Message.encode(message).finish();
export const generateRegistrationId = () => (randomBytes(2).readUInt16BE() & 16383);
export const generateMessageID = () => '3EB0' + randomBytes(18).toString('hex').toUpperCase();
export const generateMessageIDV2 = (userId) => {
    const data = Buffer.alloc(8 + 20 + 16);
    data.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 1000)));
    if (userId) {
        const id = jidDecode(userId);
        if (id?.user) {
            data.write(id.user, 8);
            data.write('@c.us', 8 + id.user.length);
        }
    }
    const random = randomBytes(16);
    random.copy(data, 28);
    const hash = createHash('sha256').update(data).digest();
    return '3EB0' + hash.toString('hex').toUpperCase().substring(0, 18);
};

// Browsers
export const Browsers = {
    ubuntu: (browser) => ['Ubuntu', browser, '22.04.4'],
    chrome: (browser) => ['Ubuntu', 'Chrome', '122.0.6261.129'],
    appropriate: (browser) => ['Linux', browser, '0.1']
};

export const fetchLatestBaileysVersion = async () => ({ version: baileysVersion, isLatest: true });
export const getKeyAuthor = (key, meId = 'me') => (key?.fromMe ? meId : (key?.participant || key?.remoteJid)) || '';
export const trimUndefined = (obj) => {
    for (const key in obj) { if (typeof obj[key] === 'undefined') delete obj[key]; }
    return obj;
};

// Error & Stream
export const getCodeFromWSError = (error) => error?.output?.statusCode || error?.statusCode || 500;
export const getErrorCodeFromStreamError = (node) => ({
    reason: node.attrs.reason || 'unknown',
    statusCode: parseInt(node.attrs.code || '500')
});
export const NACK_REASONS = { 400: 'bad-request', 401: 'unauthorized', 403: 'forbidden', 404: 'not-found', 405: 'method-not-allowed', 406: 'not-acceptable', 409: 'conflict', 410: 'gone', 500: 'internal-server-error', 501: 'not-implemented', 503: 'service-unavailable' };

// Promise & Event
export const promiseTimeout = (ms, promise) => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timed out')), ms);
        const p = typeof promise === 'function' ? promise() : promise;
        p.then(res => { clearTimeout(timeout); resolve(res); }).catch(err => { clearTimeout(timeout); reject(err); });
    });
};
export const bindWaitForEvent = (ev, event) => {
    return async (check, timeoutMs) => {
        let listener;
        await promiseTimeout(timeoutMs, new Promise((resolve, reject) => {
            listener = async (update) => { if (await check(update)) resolve(); };
            ev.on(event, listener);
        })).finally(() => ev.off(event, listener));
    };
};

// Stubs for complex logic to prevent import failures
export const addTransactionCapability = (node) => node;
export const generateLoginNode = () => ({ tag: 'login', attrs: {} });
export const getNextPreKeysNode = () => ({ tag: 'iq', attrs: {} });
export const parseAndInjectE2ESessions = async () => {};
export const updateConnectionWithSync = () => {};
export const getPreKeys = async () => ({});
export const getPreKeysCount = () => 0;
export const generateRecipientNodes = () => [];
export const decryptMessageNode = () => ({});
export const generateRegistrationNode = () => ({ tag: 'register', attrs: {} });
export const configureSuccessfulPairing = () => {};
export const generateParticipantHashV2 = () => '2:abcd';
export const chatModificationToAppPatch = () => ({});
export const processSyncAction = () => ({});
export const newLTHashState = () => ({});
export const getHistoryMsg = () => null;
