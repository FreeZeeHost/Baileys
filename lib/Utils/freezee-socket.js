"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0
const socket_1 = require("../Socket")
const use_mongo = require("./use-mongo-file-auth-state")
const { patchSocket } = require("./socket-patcher")
const { initAuthCreds } = require("./generics")

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
    
    // Apply FreeZee Premium Patches
    const patchedSock = patchSocket(sock)

    use_mongo.useMongoFileAuthState().then(({ state: mongoState, saveCreds }) => {
        Object.assign(state.creds, mongoState.creds)
        state.keys = mongoState.keys
        patchedSock.ev.on('creds.update', saveCreds)
    })
    
    return patchedSock
}
exports.makeFreeZeeSocket = makeFreeZeeSocket
