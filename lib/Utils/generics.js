"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const crypto = require("crypto")

exports.baileysVersion = [2, 3100, 2]

exports.BufferJSON = {
    replacer: (k, value) => {
        if (Buffer.isBuffer(value) || value instanceof Uint8Array || value?.type === 'Buffer') {
            return { type: 'Buffer', data: Buffer.from(value?.data || value).toString('base64') }
        }
        return value
    },
    reviver: (_, value) => {
        if (typeof value === 'object' && value !== null && value.type === 'Buffer' && typeof value.data === 'string') {
            return Buffer.from(value.data, 'base64')
        }
        return value
    }
}

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
    }
}

exports.generateMdTagPrefix = () => {
    const bytes = crypto.randomBytes(4);
    return bytes.readUInt16BE() + "." + bytes.readUInt16BE(2) + "-";
}

exports.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

exports.toNumber = (t) => typeof t === "object" && t ? ("toNumber" in t ? t.toNumber() : t.low) : t || 0

exports.unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000)

exports.encodeBigEndian = (e, t = 4) => {
    let r = e
    const a = new Uint8Array(t)
    for (let i = t - 1; i >= 0; i--) { a[i] = 255 & r; r >>>= 8 }
    return a
}

exports.generateRegistrationId = () => (crypto.randomBytes(2).readUInt16BE() & 16383)

exports.generateMessageID = () => '3EB0' + crypto.randomBytes(18).toString('hex').toUpperCase()

exports.Browsers = {
    ubuntu: (browser) => ['Ubuntu', browser, '22.04.4'],
    macOS: (browser) => ['Mac OS', browser, '13.5.2'],
    windows: (browser) => ['Windows', browser, '10.0.22631'],
    chrome: (browser) => ['Ubuntu', 'Chrome', '122.0.6261.129'],
    appropriate: (browser) => {
        const os = require('os')
        return [os.platform(), browser, os.release()]
    }
}

exports.fetchLatestBaileysVersion = async () => ({ version: exports.baileysVersion, isLatest: true });

exports.bindWaitForEvent = (ev, event) => {
    return async (check, timeoutMs) => {
        let listener;
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Timed out')), timeoutMs);
            listener = async (update) => {
                if (await check(update)) {
                    clearTimeout(timeout);
                    resolve();
                }
            };
            ev.on(event, listener);
        }).finally(() => ev.off(event, listener));
    };
};

exports.bindWaitForConnectionUpdate = (ev) => exports.bindWaitForEvent(ev, 'connection.update');
