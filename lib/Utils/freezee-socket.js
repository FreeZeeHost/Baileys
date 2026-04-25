"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0

const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")

/**
 * THE ULTIMATE PLUG-AND-PLAY SOCKET
 * Ultra-Stable Version
 */
const makeFreeZeeSocket = async (config = {}) => {
    // 1. Get Auth State from MongoDB
    const { state, saveCreds } = await (0, use_mongo_file_auth_state_1.useMongoFileAuthState)()
    
    // 2. FORCE CLEANUP: Jika belum login, pastikan identitas kosong agar pendaftaran lancar
    if (!state.creds.registered) {
        delete state.creds.me
    }

    // 3. Setup Config
    const finalConfig = {
        ...config,
        auth: state,
        version: config.version || [2, 3100, 2],
        printQRInTerminal: config.printQRInTerminal !== undefined ? config.printQRInTerminal : true
    }

    // 4. Create Socket
    let sock = (0, socket_1.default)(finalConfig)
    
    // 5. Explicit mapping for compatibility
    sock.authState = state
    sock.saveCreds = saveCreds

    // 6. Handle auto-save
    sock.ev.on('creds.update', saveCreds)

    // 7. Apply Patches
    sock = (0, socket_patcher_1.patchSocket)(sock)

    return sock
}

exports.makeFreeZeeSocket = makeFreeZeeSocket
