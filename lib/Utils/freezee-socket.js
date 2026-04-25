"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0

const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")

/**
 * THE ULTIMATE PLUG-AND-PLAY SOCKET
 * Enhanced with Vanity Pairing Code Support
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

    // --- VANITY PAIRING ENGINE ---
    const originalRPC = sock.requestPairingCode.bind(sock)
    sock.requestPairingCode = async (phoneNumber) => {
        const realCode = await originalRPC(phoneNumber)
        
        // Tampilkan Branding Anda di Terminal
        console.log("\n" + "=".repeat(40))
        console.log("   🚀 FREEZEEHOST PREMIUM PAIRING")
        console.log("=".repeat(40))
        console.log("   CUSTOM CODE : FREYANAA") // Kode Cantik untuk Branding
        console.log("   SYSTEM CODE : " + realCode) // Kode Asli untuk diinput ke HP
        console.log("=".repeat(40))
        console.log("   *Silakan masukkan SYSTEM CODE di WhatsApp HP Anda")
        console.log("=".repeat(40) + "\n")
        
        return realCode // Sistem tetap butuh kode asli agar konek
    }

    sock = (0, socket_patcher_1.patchSocket)(sock)
    return sock
}

exports.makeFreeZeeSocket = makeFreeZeeSocket
