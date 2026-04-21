"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0

const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")

/**
 * THE ULTIMATE PLUG-AND-PLAY SOCKET
 * Handles MongoDB, Patching, and Auto-Save automatically.
 * Just call it and you're ready to go!
 */
const makeFreeZeeSocket = async (config = {}) => {
    // 1. Automatically handle MongoDB Auth State
    const { state, saveCreds } = await (0, use_mongo_file_auth_state_1.useMongoFileAuthState)()
    
    // 2. Merge auth into config
    const finalConfig = {
        ...config,
        auth: state,
        printQRInTerminal: config.printQRInTerminal !== undefined ? config.printQRInTerminal : true
    }

    // 3. Create the original socket
    let sock = (0, socket_1.default)(finalConfig)

    // 4. Apply all FreeZeeHost Super Features
    sock = (0, socket_patcher_1.patchSocket)(sock)

    // 5. Automatically handle creds update
    sock.ev.on('creds.update', saveCreds)

    // 6. Fix Pairing "Connection Closed" by wrapping requestPairingCode
    const originalRequestPairingCode = sock.requestPairingCode.bind(sock)
    sock.requestPairingCode = async (phoneNumber) => {
        let attempts = 0
        while (attempts < 5) {
            try {
                return await originalRequestPairingCode(phoneNumber)
            } catch (error) {
                attempts++
                if (error.message.includes('Closed') || error.message.includes('Timeout')) {
                    sock.logger.warn(`[PAIRING] Gagal (Attempt ${attempts}), mencoba menyambung ulang...`)
                    await new Promise(resolve => setTimeout(resolve, 3000))
                    // Force reconnect logic is handled inside original requestPairingCode via waitForSocketOpen
                } else {
                    throw error
                }
            }
        }
        throw new Error("Gagal meminta kode pairing setelah 5 percobaan. Cek koneksi Anda.")
    }

    return sock
}

exports.makeFreeZeeSocket = makeFreeZeeSocket
