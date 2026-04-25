"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0
const socket_1 = require("../Socket")
const use_mongo = require("./use-mongo-file-auth-state")

// LOGIKA PENDAFTARAN MANDIRI (ANTI CRASH)
const initAuthCreds = () => {
    const crypto = require("crypto");
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

const makeFreeZeeSocket = (config = {}) => {
    const state = config.auth || {
        creds: initAuthCreds(),
        keys: { get: async () => ({}), set: async () => {} }
    }
    const sock = (0, socket_1.default)({
        ...config,
        auth: state,
        version: config.version || [2, 3100, 2]
    })
    sock.authState = state
    use_mongo.useMongoFileAuthState().then(({ state: mongoState, saveCreds }) => {
        Object.assign(state.creds, mongoState.creds)
        state.keys = mongoState.keys
        sock.ev.on('creds.update', saveCreds)
    })
    return sock
}
exports.makeFreeZeeSocket = makeFreeZeeSocket
