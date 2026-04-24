"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0
const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")
const makeFreeZeeSocket = async (config = {}) => {
    console.log(">>>> [1/4] Mencoba koneksi ke MongoDB...")
    try {
        const { state, saveCreds } = await (0, use_mongo_file_auth_state_1.useMongoFileAuthState)()
        console.log(">>>> [2/4] Database Terhubung. Menyiapkan Socket...")
        const sock = (0, socket_1.default)({
            ...config,
            auth: state,
            version: config.version || [2, 3000, 1017531287]
        })
        console.log(">>>> [3/4] Melakukan Patching Fitur...")
        const patched = (0, socket_patcher_1.patchSocket)(sock)
        patched.ev.on('creds.update', saveCreds)
        console.log(">>>> [4/4] Bot Siap! Mengembalikan objek socket ke script utama.")
        return patched
    } catch (err) {
        console.error("!!!! FATAL ERROR SAAT STARTUP:", err.message)
        throw err
    }
}
exports.makeFreeZeeSocket = makeFreeZeeSocket
