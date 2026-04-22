"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0

const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")
const generics_1 = require("./generics")

/**
 * THE ULTIMATE PLUG-AND-PLAY SOCKET
 * Fixed for high-stability pairing (2026 Edition)
 */
const makeFreeZeeSocket = async (config = {}) => {
    // 1. Automatically handle MongoDB Auth State
    const { state, saveCreds } = await (0, use_mongo_file_auth_state_1.useMongoFileAuthState)()
    
    // 2. Ensure we start fresh for new registration
    if (!state.creds.registered) {
        delete state.creds.me
    }

    // 3. Force High-Trust Identity (Chrome/Windows)
    const finalConfig = {
        ...config,
        auth: state,
        printQRInTerminal: config.printQRInTerminal !== undefined ? config.printQRInTerminal : true,
        // Use a very stable version for pairing
        version: [2, 3100, 2], countryCode: 'ID'
    }

    // 4. Create the socket
    let sock = (0, socket_1.default)(finalConfig)

    // 5. Apply all FreeZeeHost Super Features
    sock = (0, socket_patcher_1.patchSocket)(sock)

    // 6. Automatically handle creds update
    sock.ev.on('creds.update', saveCreds)

    // 7. ULTRA ROBUST PAIRING LOGIC
    const originalRequestPairingCode = sock.requestPairingCode.bind(sock)
    sock.requestPairingCode = async (phoneNumber) => {
        console.log(`[PAIRING] Mempersiapkan enkripsi untuk ${phoneNumber}...`)
        
        // STABILIZATION WAIT: Wait for 5 seconds to ensure Noise Handshake is finished
        await (0, generics_1.delay)(5000)

        let attempts = 0
        while (attempts < 5) {
            try {
                // Ensure state is clean before each attempt
                if (!sock.authState.creds.registered) {
                    delete sock.authState.creds.me
                }
                
                return await originalRequestPairingCode(phoneNumber)
            } catch (error) {
                attempts++
                const errMsg = error.message || ''
                if (errMsg.includes('Closed') || errMsg.includes('Timeout') || errMsg.includes('Terminated')) {
                    console.log(`[PAIRING] Reconnecting... (Attempt ${attempts}/5)`)
                    await (0, generics_1.delay)(3000)
                } else {
                    throw error
                }
            }
        }
        throw new Error("Gagal mendapatkan kode pairing. Coba restart bot Anda.")
    }

    return sock
}

exports.makeFreeZeeSocket = makeFreeZeeSocket
