"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0
const socket_1 = require("../Socket")
const use_mongo = require("./use-mongo-file-auth-state")
const generics = require("./generics")

const makeFreeZeeSocket = (config = {}) => {
    const state = config.auth || {
        creds: generics.initAuthCreds(),
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
