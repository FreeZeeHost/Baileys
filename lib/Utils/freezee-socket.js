"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0

const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")

/**
 * THE ULTIMATE PLUG-AND-PLAY SOCKET
 * Handles MongoDB, Patching, and Auto-Save automatically.
 */
const makeFreeZeeSocket = async (config = {}) => {
    // 1. Automatically handle MongoDB Auth State
    const { state, saveCreds } = await (0, use_mongo_file_auth_state_1.useMongoFileAuthState)()
    
    // 2. IMPORTANT: If not registered, clear 'me' to avoid "Connection Terminated" 405/crash
    // This ensures we start in a clean registration mode
    if (!state.creds.registered) {
        delete state.creds.me
    }

    // 3. Merge auth into config
    const finalConfig = {
        ...config,
        auth: state,
        printQRInTerminal: config.printQRInTerminal !== undefined ? config.printQRInTerminal : true
    }

    // 4. Create the socket
    let sock = (0, socket_1.default)(finalConfig)

    // 5. Apply all FreeZeeHost Super Features
    sock = (0, socket_patcher_1.patchSocket)(sock)

    // 6. Automatically handle creds update
    sock.ev.on('creds.update', saveCreds)

    // 7. Robust Pairing Logic
    const originalRequestPairingCode = sock.requestPairingCode.bind(sock)
    sock.requestPairingCode = async (phoneNumber, customCode) => {
        // Reset state to force registration mode
        sock.authState.creds.registered = false
        delete sock.authState.creds.me
        
        let attempts = 0
        while (attempts < 5) {
            try {
                return await originalRequestPairingCode(phoneNumber, customCode)
            } catch (error) {
                attempts++
                if (error.message.includes('Closed') || error.message.includes('Timeout') || error.message.includes('Terminated')) {
                    sock.logger.warn(`[PAIRING] Gagal (Attempt ${attempts}), mencoba menyambung ulang...`)
                    await new Promise(resolve => setTimeout(resolve, 3000))
                    // Re-connect is handled internally by waitForSocketOpen in requestPairingCode
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
