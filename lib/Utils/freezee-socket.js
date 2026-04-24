"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0
const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")
const makeFreeZeeSocket = async (config = {}) => {
    const { state, saveCreds } = await (0, use_mongo_file_auth_state_1.useMongoFileAuthState)()
    const sock = (0, socket_1.default)({
        ...config,
        auth: state,
        version: config.version || [2, 3000, 1017531287]
    })
    const patched = (0, socket_patcher_1.patchSocket)(sock)
    patched.ev.on('creds.update', saveCreds)
    return patched
}
exports.makeFreeZeeSocket = makeFreeZeeSocket
