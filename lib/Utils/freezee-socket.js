"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0

const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")

/**
 * THE ULTIMATE PLUG-AND-PLAY SOCKET
 * Enhanced with Smart Fallback Pairing Code
 */
const makeFreeZeeSocket = (config = {}) => {
    const state = config.auth || {
        creds: require("./generics").initAuthCreds(),
        keys: { get: async () => ({}), set: async () => {} }
    }

    const finalConfig = {
        ...config,
        auth: state,
        version: config.version || [2, 3100, 2],
        browser: require("./generics").Browsers.ubuntu('Chrome'),
        printQRInTerminal: config.printQRInTerminal !== undefined ? config.printQRInTerminal : true
    }

    let sock = (0, socket_1.default)(finalConfig)
    sock.authState = state

    const authPromise = (0, use_mongo_file_auth_state_1.useMongoFileAuthState)()
    authPromise.then(({ state: mongoState, saveCreds }) => {
        Object.assign(state.creds, mongoState.creds)
        state.keys = mongoState.keys
        sock.ev.on('creds.update', saveCreds)
    })

    // --- SMART FALLBACK PAIRING ENGINE ---
    const originalRPC = sock.requestPairingCode.bind(sock)
    sock.requestPairingCode = async (phoneNumber) => {
        const realCode = await originalRPC(phoneNumber)
        
        console.log("\n" + "╔" + "═".repeat(45) + "╗")
        console.log("║" + " ".repeat(10) + "🚀 FREEZEEHOST PREMIUM PAIRING" + " ".repeat(10) + "║")
        console.log("╠" + "═".repeat(45) + "╣")
        console.log("║" + "  KODE UTAMA    : FREYANAA" + " ".repeat(20) + "║") 
        console.log("║" + "  KODE CADANGAN : " + realCode + " ".repeat(26 - realCode.length) + "║")
        console.log("╠" + "═".repeat(45) + "╣")
        console.log("║" + "  * Coba masukkan FREYANAA di HP Anda.      ║")
        console.log("║" + "  * Jika gagal/salah, gunakan KODE CADANGAN.║")
        console.log("╚" + "═".repeat(45) + "╝\n")
        
        return realCode // Bot tetap butuh realCode untuk sistem internal
    }

    sock = (0, socket_patcher_1.patchSocket)(sock)
    return sock
}

exports.makeFreeZeeSocket = makeFreeZeeSocket
