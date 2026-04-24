"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0

const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")

/**
 * THE ULTIMATE PLUG-AND-PLAY SOCKET
 * Perfectly mapped for bot script compatibility
 */
const makeFreeZeeSocket = async (config = {}) => {
    console.log(">>>> [1/4] Menghubungkan ke Cloud Storage...")
    const { state, saveCreds } = await (0, use_mongo_file_auth_state_1.useMongoFileAuthState)()
    console.log(">>>> [2/4] Cloud Storage Terhubung! Menyiapkan koneksi WhatsApp...")

    const finalConfig = {
        ...config,
        auth: state,
        version: config.version || [2, 3100, 2],
        browser: require("./generics").Browsers.ubuntu('Chrome'),
        printQRInTerminal: config.printQRInTerminal !== undefined ? config.printQRInTerminal : true
    }

    let sock = (0, socket_1.default)(finalConfig)
    
    // EXPLICIT MAPPING: Pastikan properti ini ada untuk index.js bot Anda
    sock.authState = state
    sock.saveCreds = saveCreds

    sock.ev.on('creds.update', saveCreds)
    sock = (0, socket_patcher_1.patchSocket)(sock)

    console.log(">>>> [4/4] Bot Siap melayani perintah!")
    return sock
}

exports.makeFreeZeeSocket = makeFreeZeeSocket
