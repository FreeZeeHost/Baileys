import { createHash, randomBytes } from 'crypto';
import { proto } from '../../WAProto/index.js';
import { jidDecode } from '../WABinary/index.js';

export const baileysVersion = [2, 3100, 2];

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

export const generateMdTagPrefix = () => {
    const bytes = randomBytes(4);
    return bytes.readUInt16BE() + "." + bytes.readUInt16BE(2) + "-";
};

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const toNumber = (t) => typeof t === "object" && t ? ("toNumber" in t ? t.toNumber() : t.low) : t || 0;
export const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000);

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

export const encodeWAMessage = (message) => {
    return writeRandomPadMax16(proto.Message.encode(message).finish());
};

export const encodeBigEndian = (e, t = 4) => {
    let r = e;
    const a = new Uint8Array(t);
    for (let i = t - 1; i >= 0; i--) { a[i] = 255 & r; r >>>= 8; }
    return a;
};

export const generateRegistrationId = () => (randomBytes(2).readUInt16BE() & 16383);

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

export const generateMessageID = () => '3EB0' + randomBytes(18).toString('hex').toUpperCase();

export const Browsers = {
    ubuntu: (browser) => ['Ubuntu', browser, '22.04.4'],
    chrome: (browser) => ['Ubuntu', 'Chrome', '122.0.6261.129'],
    appropriate: (browser) => {
        // Simple mock for browser platform in ESM
        return ['Linux', browser, '0.1'];
    }
};

export const fetchLatestBaileysVersion = async () => ({ version: baileysVersion, isLatest: true });
export const getKeyAuthor = (key, meId = 'me') => (key?.fromMe ? meId : (key?.participant || key?.remoteJid)) || '';
export const trimUndefined = (obj) => {
    for (const key in obj) { if (typeof obj[key] === 'undefined') delete obj[key]; }
    return obj;
};

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

export const getCodeFromWSError = (error) => {
    return error?.output?.statusCode || error?.statusCode || 500;
};

export const getErrorCodeFromStreamError = (node) => {
    return {
        reason: node.attrs.reason || 'unknown',
        statusCode: parseInt(node.attrs.code || '500')
    };
};
