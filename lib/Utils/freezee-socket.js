"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0

const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")
const generics_1 = require("./generics")

/**
 * THE ULTIMATE PLUG-AND-PLAY SOCKET
 * Fixed for real-time monitoring
 */
const makeFreeZeeSocket = async (config = {}) => {
    console.log("[FREEZEE] Memulai inisialisasi...")
    
    // 1. Get Auth State from MongoDB with timeout protection
    console.log("[FREEZEE] Menghubungkan ke MongoDB Cluster...")
    const { state, saveCreds } = await (0, use_mongo_file_auth_state_1.useMongoFileAuthState)()
    console.log("[FREEZEE] MongoDB Tersambung!")
    
    // 2. Setup Config
    const finalConfig = {
        ...config,
        auth: state,
        printQRInTerminal: config.printQRInTerminal !== undefined ? config.printQRInTerminal : true,
        // Gunakan versi default untuk stabilitas maksimal
        version: config.version || [2, 3100, 2],
        browser: (0, generics_1.Browsers).ubuntu('Chrome')
    }

    // 3. Create Socket
    console.log("[FREEZEE] Membuka koneksi WhatsApp...")
    let sock = (0, socket_1.default)(finalConfig)

    // 4. Apply Patches
    sock = (0, socket_patcher_1.patchSocket)(sock)

    // 5. Auto Save Creds
    sock.ev.on('creds.update', async () => {
        await saveCreds()
    })

    console.log("[FREEZEE] Socket Ready! Menunggu event 'open'...")
    return sock
}

exports.makeFreeZeeSocket = makeFreeZeeSocket
